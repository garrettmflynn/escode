import { esCompose } from "../../../../apps/showcase/demos/phaser/versions/multiplayer/index.esc";
import { Options } from "../../../common/types";
import { EditorProps } from "../../../escode/src";
import { ESComponent, ESElementInfo } from "../component";
import { resolve } from "../utils";


export type ESComponentStates = {

    // Initial
    connected: boolean,

    // Element
    element: ESComponent['esElement']
    attributes: ESComponent['esAttributes']
    parentNode: ESComponent['esParent']
    onresize: ESComponent['esOnResize']
    onresizeEventCallback: Function,

    esSource?: ESComponent['esSource']
}


function checkESCompose (esCompose) {
    if (!esCompose) return false
    const isArr = Array.isArray(esCompose)
    return (isArr) ? !esCompose.reduce((a,b) => a * (checkForInternalElements(b) ? 0 : 1), true) : checkForInternalElements(esCompose)
}

function checkForInternalElements(node){
    if (node.esElement || checkESCompose(node.esCompose)) return true
    else if (node.esDOM) return check(node.esDOM)
}

function check (target) {
    for (let key in target) {
        const node = target[key]
        let res = checkForInternalElements(node)
        if (res) return true
    }
}

export function create(id, esm: ESComponent, parent, states?, utilities: Options['utilities'] = {}) {

    // --------------------------- Get Element ---------------------------
    let element = esm.esElement as ESComponent['esElement'] | null; // Always create div at the least
    const attributes = esm.esAttributes

    let info: undefined | ESElementInfo;
    if (!(element instanceof Element)) {


        const mustShow = (attributes && Object.keys(attributes).length) || checkForInternalElements(esm)
        const defaultTagName = mustShow ? 'div' : 'link'

        // Nothing Defined
        if (element === undefined) element = defaultTagName
        else if (Array.isArray(element)) element = document.createElement(...element as [string, ElementCreationOptions]);


        // Configuration Object Defined
        else if (typeof element === 'object') {
            info = element as ESElementInfo

            // Get HTML Elememt
            if (info.selectors) element = document.querySelector(info.selectors)
            else if (info.id) element = document.getElementById(info.id)
            else element = defaultTagName // default to div
        }

        if (typeof element === 'string') element = document.createElement(element);

        // Automatically Set innerText for inoputs
        const noInput = Symbol('no input to the default function')
        if (!esm.hasOwnProperty('default')) {
            esm.default = function(input = noInput) { 
                if (input !== noInput) this.esElement.innerText = input  // Set the text of the associated element
                return this.esElement // return whole element
            }
        }
    }

    if (!(element instanceof Element)) console.warn('Element not found for', id);


    // Track All States
    let intermediateStates = states || {}
    intermediateStates.element = element,
    intermediateStates.attributes = attributes,
    intermediateStates.parentNode = esm.esParent ?? ((parent?.esElement instanceof Element) ? parent.esElement : undefined),
    intermediateStates.onresize = esm.esOnResize,
    intermediateStates.onresizeEventCallback = undefined

    const finalStates = intermediateStates as ESComponentStates
    // // Detect if Child Elements are Added and Need to be Initialized
    // states.observer = new MutationObserver(function(mutations) {
    //     mutations.forEach((mutation) =>{
    //         console.log('mutation', mutation, mutations)
    //         for(var i = 0; i < mutation.addedNodes.length; i++) {
    //             const node = mutation.addedNodes[i] as any
    //             if (node.hasAttribute instanceof Function){
    //                 if (node.hasAttribute('__isescomponent')) node.esComponent.__esReady()
    //             }
    //         }
    //     })
    // });

    // --------------------------- Assign Things to Element ---------------------------
    if (element instanceof Element) {
        if (typeof id !== 'string') id = `${element.tagName ?? 'element'}${Math.floor(Math.random() * 1000000000000000)}`;
        if (!element.id) element.id = id;
    }


    // Wait to initialize the element until it is inserted into an active DOM node
    let isReady; 

    // track if ready
    Object.defineProperty(esm, 'esReady', {
        value: new Promise(resolve => isReady = async () => {
            resolve(true)
        }),
        writable: false,
        enumerable: false,
    })
    
    // trigger if ready
    Object.defineProperty(esm, '__esReady', { value: isReady,  writable: false, enumerable: false })



    const isEventListener = (key, value) => key.slice(0,2) === 'on' && typeof value === 'function'
    const handleAttribute = (key, value, context) => {
        if (!isEventListener(key, value) && typeof value === 'function') return value.call(context)
         else return value
    }

    const setAttributes = (attributes) => {
        if (esm.esElement instanceof Element) {
            for (let key in attributes) {

                // Set Style Per Attribute
                if (key === 'style') {
                    for (let styleKey in attributes.style) esm.esElement.style[styleKey] = handleAttribute(key, attributes.style[styleKey], esm)
                }

                // Replace Whole Attribute
                else {
                    const value = attributes[key]
                    if (isEventListener(key, value)) {
                        const func = value;
                        esm.esElement[key] = (...args) => {
                            const context = esm.__esProxy ?? esm
                            return func.call(context ?? esm, ...args)
                        }; // replace this scope
                    } else esm.esElement[key] = handleAttribute(key, value, esm)
                }
            }
        }
    }

    Object.defineProperty(esm, 'esAttributes', {
        get: () => states.attributes,
        set: (value) => {
            states.attributes = value;
            if (states.attributes) setAttributes(states.attributes)
        }
    })

    // Listen for Changes to Element
    Object.defineProperty(esm, 'esElement', {
        get: function() {
            if (states.element instanceof Element) return states.element
        },
        set: function(v) {

            if (v instanceof Element) {

                if (states.element !== v){
                    states.element.insertAdjacentElement('afterend', v) // Insert New Element
                    states.element.remove() // Remove Old Element
                }

                states.element = v

                // Trigger esParent Setter on Nested Components
                if (esm.__isESComponent !== undefined) {
                    for (let name in esm.esDOM) {
                        const component = esm.esDOM[name] as ESComponent | Promise<ESComponent>; // TODO: Ensure that this is resolved first...
                        resolve(component, (res) => {
                            res.esParent = v;
                        })
                    }
                }

                // Set Attributes
                setAttributes(states.attributes)

                // states.observer.disconnect()
                // states.observer.observe(v, { childList: true });
            }
        },
        enumerable:true,
        configurable: false
    })

    Object.defineProperty(esm, 'esParent', {
        get:function () { 
            if (esm.esElement instanceof Element) return esm.esElement.parentNode; 
        },
        set:(v) => { 

            // Get Parent Node from User String
            if (typeof v === 'string') {
                const newValue = document.querySelector(v);
                if (newValue) v = newValue
                else v = document.getElementById(v);
            }

            // Set Parent Node on Element
            if (v?.esElement instanceof Element) v = v.esElement
            if (esm.esElement instanceof Element) {
                if(esm.esElement.parentNode) esm.esElement.remove()
                if (v instanceof Element) {

                    // --------------------------- Place inside ESCode Instance (if created) ---------------------------

                    const desiredPosition = esm.esChildPosition
                    const nextPosition = v.children.length

                    let ref = esm.esElement
                    const esCode = esm.__esCode
                    if (esCode) {
                        ref = esCode // Set inside parent. Set focused component in esConnected
                    }

                    // Resolved After Siblings Have Been Added
                    if (desiredPosition !== undefined && desiredPosition < nextPosition) v.children[desiredPosition].insertAdjacentElement('beforebegin', ref)
                   
                    // Resolved Immediately or Before Siblings
                    else v.appendChild(ref);

                    // ------------------ Visualize with ESCode -----------------
                    if (esCode) esCode.setComponent(esm); // Set the target component
                    
                }
            } 
            
            // Set Child Parent Nodes to This
            else {
                console.error('No element was created for this Component...', esm)
                // for (let name in esm.esDOM) {
                //     const component = esm.esDOM[name]
                //     component.esParent = v
                // }
            }

            if (
                v instanceof HTMLElement // Is element
                // && !v.hasAttribute('__isescomponent')  // Is not an ES Component (which are observed elsewhere...)
                // && v.isConnected // Is connected to the DOM
            ) {
                esm.__esReady()
            }
        },
        enumerable:true
    });

    // On Resize Function
    let onresize = esm.esOnResize
    Object.defineProperty(esm,'esOnResize',{
        get: function() { return onresize },
        set: function(foo) {
            states.onresize = foo
            if (states.onresizeEventCallback) window.removeEventListener('resize', states.onresizeEventCallback) // Stop previous listener
            if (states.onresize) {
                states.onresizeEventCallback = (ev) => { 
                    if ( states.onresize && esm.esElement instanceof Element ) {
                        const context = esm.__esProxy ?? esm
                        return foo.call(context, ev) 
                    }
                };
                window.addEventListener('resize', states.onresizeEventCallback);
            }
        },
        enumerable: true
    })


    // --------------------------- Spawn ESCode Instance ---------------------------
    if (esm.esCode) {
        let config = esm.esCode
        let cls = utilities.code?.class

        if (!cls) {
            if (typeof esm.esCode === 'function') cls = esm.esCode
            else console.error('Editor class not provided in options.utilities.code')
        }

        if (cls) {
            let options = utilities.code?.options ?? {}
            options = ((typeof config === 'boolean') ? options : {...options, ...config}) as EditorProps
            const esCode = new cls(options)
            esCode.start() // start the editor
            Object.defineProperty(esm, '__esCode', { value: esCode })
        }
    }
    

    // NOTE: If you're drilling elements, this WILL cause for infinite loop when drilling an object with getters
    if (esm.esElement instanceof Element) {
        esm.esElement.esComponent = esm
        esm.esElement.setAttribute('__isescomponent', '')
    }

    // Trigger state changes at the end (if not going to be done elsewhere)
    if (!states) {
        esm.esOnResize = finalStates.onresize
        // console.error('Produced component', esm)
        if (finalStates.parentNode) esm.esParent = finalStates.parentNode
    }

    return element;
}