import { ESComponent, ESElementInfo } from "../component";

export function create(id, esm: ESComponent, parent) {

    // --------------------------- Get Element ---------------------------
    let element = esm.esElement as ESComponent['esElement'] | null; // Always create div at the least

    let info: undefined | ESElementInfo;
    if (!(element instanceof Element)) {

        const hasChildren = esm.esDOM && Object.keys(esm.esDOM).length > 0

        const defaultTagName = hasChildren ? 'div' : 'link'

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
        if (!esm.hasOwnProperty('default')) {
            esm.default = function(input) { 
                this.esElement.innerText = input  // Has an associated element
                return input
            }
        }
    }

    if (!(element instanceof Element)) console.warn('Element not found for', id);


    let states: any = {
        element: element,
        attributes: esm.esAttributes,
        parentNode: esm.esParent ?? ((parent?.esElement instanceof Element) ? parent.esElement : undefined),
        onresize: esm.esOnResize,
        onresizeEventCallback: undefined,
    }

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
        value: new Promise(resolve => isReady = () => resolve(true)),
        writable: false,
        enumerable: false,
    })

    // trigger if ready
    Object.defineProperty(esm, '__esReady', { value: isReady,  writable: false, enumerable: false })


    const setAttributes = (attributes) => {
        if (esm.esElement instanceof Element) {
            for (let key in attributes) {

                // Set Style Per Attribute
                if (key === 'style') {
                    for (let styleKey in attributes.style) esm.esElement.style[styleKey] = attributes.style[styleKey]
                }

                // Replace Whole Attribute
                else {
                    if (typeof attributes[key] === 'function') {
                        const func = attributes[key];
                        esm.esElement[key] = (...args) => {
                            const context = esm.__esProxy ?? esm
                            return func.call(context ?? esm, ...args)
                        }; // replace this scope
                    } else esm.esElement[key] = attributes[key];
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
                for (let name in esm.esDOM) {
                    const component = esm.esDOM[name] as ESComponent;
                    component.esParent = v
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
                if (v) v.appendChild(esm.esElement);
            } 
            
            // Set Child Parent Nodes to This
            else {
                for (let name in esm.esDOM) {
                    const component = esm.esDOM[name]
                    component.esParent = v
                }
            }

            if (
                v instanceof HTMLElement // Is element
                // && !v.hasAttribute('__isescomponent')  // Is not an ES Component (which are observed elsewhere...)
                // && v.isConnected // Is connected to the DOM
            ) esm.__esReady()
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

    esm.esOnResize = states.onresize
    esm.esParent = states.parentNode

    // NOTE: If you're drilling elements, this WILL cause for infinite loop when drilling an object with getters
    if (esm.esElement instanceof Element) {
        esm.esElement.esComponent = esm
        esm.esElement.setAttribute('__isescomponent', '')
    }

    return element;
}

