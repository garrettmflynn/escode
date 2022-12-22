import { Options } from "../../../../common/types";
import { EditorProps } from "../../../../escode/src";
import { ESComponent, ESDefineInfo, ESElementInfo } from "../../../../esc";
import { resolve } from "../../utils";
import { specialKeys } from "../../../../esc/standards";

// Other Loaders
import pathLoader from "../../core/loaders/path/index"; // TODO: Fully separate this out...
import * as component from "../define/index"; // TODO: Fully separate this out...


// Proper SVG Support
// Incomplete SVG Support List: https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const createSVG = (name = 'svg', options?: ElementCreationOptions) => document.createElementNS("http://www.w3.org/2000/svg", name, options)


export type ESComponentStates = {

    // Initial
    connected: boolean,

    // Element
    element: HTMLElement // resolved element
    attributes: ESComponent['__attributes']
    parentNode: ESComponent['__parent']
    onresize: ESComponent['__onresize']
    onresizeEventCallback: EventListener,

    initial: {
        start: ESComponent['__onconnected'],
        stop: ESComponent['__ondisconnected']
    }

    __source?: ESComponent['__source']
}


function checkESCompose (__compose) {
    if (!__compose) return false
    const isArr = Array.isArray(__compose)
    return (isArr) ? !__compose.reduce((a,b) => a * (checkForInternalElements(b) ? 0 : 1), true) : checkForInternalElements(__compose)
}

function checkForInternalElements(node){
    if (node.__element || checkESCompose(node.__compose)) return true
    else if (node.__) return check(node.__.components)
}

function check (components) {
    components.forEach(component => {
        let res = checkForInternalElements(component)
        if (res) return true
    })
}


const createElement = (args: [string, ElementCreationOptions?], parent) => {
    if (args[0] === 'svg' || ( parent && parent.__element instanceof SVGElement)) return createSVG(...args)
    else return document.createElement(...args)
}


const boundEditorKey = `__bound${specialKeys.editor}s`


export const name = 'element'

export const required = true

export const properties = {
    dependents: [
        specialKeys.element, 
        specialKeys.attributes, 
        specialKeys.resize, 
        specialKeys.resolved, 
        specialKeys.childPosition, 
        specialKeys.editor, 
        specialKeys.component, 
        specialKeys.attribute,

        // Track Connection to the DOM
        specialKeys.connected, 
    ],
    dependencies: [
        specialKeys.parent, 
        specialKeys.isGraphScript, 
        specialKeys.proxy, 
    ],
}

export default function create(esm: ESComponent, _, options:Partial<Options> = {}) {

    const configuration = esm[specialKeys.isGraphScript]
    let states = configuration.states
    let id = configuration.path.split(options.keySeparator).slice(-1)[0]

    const parent = esm[specialKeys.parent] // Grab temporary parent

    // --------------------------- Get Element ---------------------------
    let element = esm[specialKeys.element] as ESComponent['__element'] | null; // Always create div at the least
    const attributes = esm[specialKeys.attributes]


    let info: undefined | ESComponent['__element'];
    if (!(element instanceof Element)) {


        const mustShow = (attributes && Object.keys(attributes).length) || checkForInternalElements(esm)
        const defaultTagName = mustShow ? 'div' : 'link'

        // ------------------ Register Components (children) ------------------
        const isWebComponent = element && typeof element === 'object' && (element as any).name && (element as any).extends
        if (isWebComponent) {
            const esDefineInfo = element as ESDefineInfo
            const config = esm[specialKeys.element]
            component.define(config, esm)
            console.log('Defining a custom element', esDefineInfo.name, esDefineInfo.extends)
            esm[specialKeys.element] = element = esDefineInfo.name // create a custom element
        }
        
        // Nothing Defined
        if (element === undefined) element = defaultTagName
        else if (Array.isArray(element)) element = createElement(element as [string, ElementCreationOptions], parent);


        // Configuration Object Defined
        else if (typeof element === 'object') {
            info = element as ESElementInfo

            // Get HTML Elememt
            if (info.selectors) element = document.querySelector(info.selectors)
            else if (info.id) element = document.getElementById(info.id)
            else element = defaultTagName // default to div
        }

        if (typeof element === 'string') element = createElement([element], parent);

        // Automatically Set innerText for inoputs
        const noInput = Symbol('no input to the default function')
        if (!esm.hasOwnProperty('default')) {
            esm.default = function(input = noInput) { 
                if (input !== noInput) this[specialKeys.element].innerText = input  // Set the text of the associated element
                return this[specialKeys.element] // return whole element
            }
        }
    }

    if (!(element instanceof Element)) throw new Error('Element not created for ' + id);

    // Track All States
    let intermediateStates = states || {};
    intermediateStates.element = element;
    intermediateStates.attributes = attributes;
    if (parent instanceof Element) intermediateStates.parentNode = parent;
    else intermediateStates.parentNode = parent?.[specialKeys.element] instanceof Element ? parent[specialKeys.element] : element.parentNode; // Update based on Component hierarchy—or fallback to existing parent (if not nested...)
    intermediateStates.onresize = esm[specialKeys.resize];
    intermediateStates.onresizeEventCallback = undefined;

    const finalStates = intermediateStates as ESComponentStates

    // // Detect if Child Elements are Added and Need to be Initialized
    // states.observer = new MutationObserver(function(mutations) {
    //     mutations.forEach((mutation) =>{
    //         console.log('mutation', mutation, mutations)
    //         for(var i = 0; i < mutation.addedNodes.length; i++) {
    //             const node = mutation.addedNodes[i] as any
    //             if (node.hasAttribute instanceof Function){
    //                 if (node.hasAttribute('escomponent')) node.__component.__esReady()
    //             }
    //         }
    //     })
    // });

    // --------------------------- Assign Things to Element ---------------------------
    if (typeof id !== 'string') id = `${element.tagName ?? 'element'}${Math.floor(Math.random() * 1000000000000000)}`;
    if (!element.id) element.id = id;


    // Wait to initialize the element until it is inserted into an active DOM node
    let isConnected, isResolved; 

    // track if ready
    Object.defineProperty(esm, `${specialKeys.connected}`, {
        value: new Promise(resolve => isConnected = async () => {
            Object.defineProperty(esm, `__${specialKeys.connected}`, { value: true })
            resolve(true)
        }),
    })

    Object.defineProperty(esm, `${specialKeys.resolved}`, {
        value: new Promise(resolve => isResolved = async () => {
            resolve(true)
        }),
    })
    
    // trigger if ready
    Object.defineProperty(esm, `__${specialKeys.connected}`, { value: isConnected,  writable: true })
    Object.defineProperty(esm, `__${specialKeys.resolved}`, { value: isResolved })


    const isEventListener = (key, value) => key.slice(0,2) === 'on' && typeof value === 'function'
    const handleAttribute = (key, value, context) => {
        if (!isEventListener(key, value) && typeof value === 'function') return value.call(context)
         else return value
    }

    const setAttributes = (attributes) => {

        if (esm[specialKeys.element] instanceof Element) {
            for (let key in attributes) {

                // Set Style Per Attribute
                if (key === 'style') {
                    for (let styleKey in attributes.style) esm[specialKeys.element].style[styleKey] = handleAttribute(key, attributes.style[styleKey], esm)
                }

                // Replace Whole Attribute
                else {
                    const value = attributes[key]
                    if (isEventListener(key, value)) {
                        const func = value;
                        esm[specialKeys.element][key] = (...args) => {
                            const context = esm[specialKeys.proxy] ?? esm
                            return func.call(context ?? esm, ...args)
                        }; // replace this scope
                    } else {
                        const valueToSet = handleAttribute(key, value, esm)

                        // Set in two different ways
                        esm[specialKeys.element].setAttribute(key, valueToSet)
                        try { esm[specialKeys.element][key] = valueToSet} catch (e) {};
                    }
                }
            }
        }
    }

    Object.defineProperty(esm, specialKeys.attributes, {
        get: () => finalStates.attributes,
        set: (value) => {
            finalStates.attributes = value;
            if (finalStates.attributes) setAttributes(finalStates.attributes)
        }
    })

    // Listen for Changes to Element
    Object.defineProperty(esm, specialKeys.element, {
        get: function() {
            if (finalStates.element instanceof Element) return finalStates.element
        },
        set: function(v) {

            if (v instanceof HTMLElement) {

                if (finalStates.element !== v){
                    finalStates.element.insertAdjacentElement('afterend', v) // Insert New Element
                    finalStates.element.remove() // Remove Old Element
                }

                finalStates.element = v

                // Trigger __parent Setter on Nested Components
                const configuration = esm[specialKeys.isGraphScript]
                if (configuration) {
                    const components = configuration.components
                    for (let name in components) {
                        const component = components[name] as ESComponent | Promise<ESComponent>; // TODO: Update these types since resolution order is different
                        if (component && component[specialKeys.isGraphScript]){
                            resolve(component, (res) => res[specialKeys.parent] = v)
                        }
                    }
                }

                // Set Attributes
                setAttributes(finalStates.attributes)

                // finalStates.observer.disconnect()
                // finalStates.observer.observe(v, { childList: true });
            }
        },
    })

    // Hijack existing parent node properties
    Object.defineProperty(esm, specialKeys.parent, {
        get:function () { 
            const parentNode = esm[specialKeys.element].parentNode // Grab parent from DOM

            // Return parent component
            if (parentNode && parentNode.hasAttribute(specialKeys.attribute)) return parentNode[specialKeys.component]
            
            // Else return a mock parent component
            else return { [specialKeys.element]: parentNode }
        },
        set:(v) => { 

            // Get Parent Node from User String
            if (typeof v === 'string') {
                const newValue = document.querySelector(v);
                if (newValue) v = newValue
                else v = document.getElementById(v);
            }

            if (v?.__node?.ref) v = v.__node.ref

            // Set Parent Node on Element
            if (v?.[specialKeys.element] instanceof Element) v = v[specialKeys.element]


            const current = esm[specialKeys.element].parentNode

            if (current !== v){
                if (esm[specialKeys.element] instanceof Element) {
                    if(current) esm[specialKeys.element].remove()

                    if (v instanceof Element) {

                        // --------------------------- Place inside ESCode Instance (if created) ---------------------------

                        const desiredPosition = esm[specialKeys.childPosition]
                        const nextPosition = v.children.length

                        let ref = esm[specialKeys.element]

                        const __editor = esm[`__${specialKeys.editor}`]

                        if (__editor) ref = __editor // Set inside parent. Set focused component in __onconnected

                        // Resolved After Siblings Have Been Added

                        const toMove = desiredPosition !== undefined && desiredPosition < nextPosition
                        const length = v.children.length
                        const before = (length && desiredPosition !== undefined) ? v.children[desiredPosition] ?? v.children[length - 1] : undefined
                        if (before) {
                            const beforeComponent = before[specialKeys.component]
                            const beforedDesiredPosition = beforeComponent[specialKeys.childPosition]
                            const location = (beforedDesiredPosition < desiredPosition) ? 'afterend' : 'beforebegin'
                            before.insertAdjacentElement(location, ref)
                        } else v.appendChild(ref);


                        // ------------------ Visualize with ESCode -----------------
                        if (__editor) __editor.setComponent(esm); // Set the target component
                    }
                } 
                
                // Set Child Parent Nodes to This
                else {
                    console.error('No element was created for this Component...', esm)
                }
            }


            if (v instanceof HTMLElement) {
                pathLoader(esm, {[specialKeys.parent]: v, [specialKeys.isGraphScript]:  {path: id}}, options) // update path
        
                // Start the component | NOTE: This is a hacky dependendy on the start loader...
                const isConnected = esm[`__${specialKeys.connected}`]
                const toConnect = isConnected instanceof Function

                esm[specialKeys.isGraphScript].start.run()
                if (toConnect) isConnected()
            }
        },
    });

    // On Resize Function
    let onresize = esm[specialKeys.resize]
    Object.defineProperty(esm,specialKeys.resize,{
        get: function() { return onresize },
        set: function(foo) {
            finalStates.onresize = foo
            if (finalStates.onresizeEventCallback) window.removeEventListener('resize', finalStates.onresizeEventCallback) // Stop previous listener
            if (finalStates.onresize) {
                finalStates.onresizeEventCallback = (ev) => { 
                    if ( finalStates.onresize && esm[specialKeys.element] instanceof Element ) {
                        const context = esm[specialKeys.proxy] ?? esm
                        return foo.call(context, ev) 
                    }
                };
                window.addEventListener('resize', finalStates.onresizeEventCallback);
            }
        },
    })


    // --------------------------- Spawn ESCode Instance ---------------------------
    const utilities = options?.utilities
    if (utilities && esm[specialKeys.editor]) {
        let config = esm[specialKeys.editor]
        let cls = utilities.code?.class

        if (!cls) {
            if (typeof config === 'function') cls = config
            else console.error('Editor class not provided in options.utilities.code')
        }


        if (cls) {
            let options = utilities.code?.options ?? {}
            options = ((typeof config === 'boolean') ? options : {...options, ...config}) as EditorProps
            const bound = options.bind
            const __editor = new cls(options)
            __editor.start() // start the editor

            // Attach editor to component (ui)
            Object.defineProperty(esm, `__${specialKeys.editor}`, { value: __editor })

            // Bind component to editor (graph)
            if (bound !== undefined) {

                let boundESM = esm // TODO: Use graphscript to find a specific node using relative uri
                bound.split('/').forEach(str => {
                    if (str === '..') boundESM = boundESM[specialKeys.isGraphScript].states.parentNode[specialKeys.component] // Move to parent
                    else if (str === '.') return // Do nothing
                    else boundESM = boundESM[str] // Move to child
                }) 

                const key = boundEditorKey
                if (!boundESM[key]) Object.defineProperty(boundESM, key, { value: [__editor] })
                else boundESM[key].push(__editor)
            }
        }
    }
    

    // --------------------------- Set Element Attributes ---------------------------
    esm[specialKeys.element][specialKeys.component] = esm
    esm[specialKeys.element].setAttribute(specialKeys.attribute, '')
    esm[specialKeys.element] = esm[specialKeys.element] // Trigger __attributes setters

    // --------------------------- Trigger State Changes (if not accessible elsewhere) ---------------------------
    // if (!states) {

    configuration.start.add(() =>{
        esm[specialKeys.resize] = finalStates.onresize
        if (finalStates.parentNode) esm[specialKeys.parent] = finalStates.parentNode
    }, 'before')

    configuration.stop.add(() => {
        esm[specialKeys.element].remove();

        // Remove code editor
        const privateEditorKey = `${specialKeys.editor}Attached` // TODO: Ensure esc key is standard
        if (esm[privateEditorKey]) esm[privateEditorKey].remove() 

    })

    return esm;
}