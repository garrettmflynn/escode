import { ESComponent, ESElementInfo } from "../component";

export function create(id, esm: ESComponent, parent) {

    // --------------------------- Get Element ---------------------------
    let element = esm.esElement as ESComponent['esElement'] | null; // Always create div at the least

    let info: undefined | ESElementInfo;
    if (!(element instanceof Element)) {
        if (element === undefined) element = 'div'
        else if (typeof element === 'object') {
            info = element as ESElementInfo
            if (info.element instanceof Element) element = info.element
            else if (info.selectors) element = document.querySelector(info.selectors)
            else if (info.id) element = document.getElementById(info.id)
            else if (!info.hasOwnProperty('element')) element = 'div'
            else element = info.element
        }

        if (typeof element === 'string') element = document.createElement(element);
    }

    if (!(element instanceof Element)) console.warn('Element not found for', id);


    let states: any = {
        element: element,
        parentNode: esm.esParent ?? info?.parentNode ?? ((parent?.esElement instanceof Element) ? parent.esElement : undefined),
        onresize: esm.esOnResize,
        onresizeEventCallback: undefined,
    }

    // --------------------------- Assign Things to Element ---------------------------
    if (element instanceof Element) {

        // Set ID
        if (typeof id !== 'string') id = `${element.tagName ?? 'element'}${Math.floor(Math.random() * 1000000000000000)}`;
        if (!element.id) element.id = id;

        if (info) {

            // Set Attributes
            if (info.attributes) {
                for (let key in info.attributes) {
                    if (typeof info.attributes[key] === 'function') {
                        const func = info.attributes[key];

                        element[key] = (...args) => {
                            const context = esm.__esProxy ?? esm
                            return func.call(context ?? esm, ...args)
                        }; // replace this scope
                    } else element[key] = info.attributes[key];
                }
            }

            // Set Style
            if (element instanceof HTMLElement && info.style) Object.assign(element.style, info.style);
        }
    }


    // Listen for Changes to Element
    Object.defineProperty(esm, 'esElement', {
        get: function() {
            if (states.element instanceof Element) return states.element
        },
        set: function(v) {
            if (v instanceof Element) {
                states.element = v

                // Trigger esParent Setter on Nested Components
                for (let name in esm.esComponents) {
                    const component = esm.esComponents[name] as ESComponent;
                    component.esParent = v
                }
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
                for (let name in esm.esComponents) {
                    const component = esm.esComponents[name]
                    component.esParent = v
                }
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

    esm.esOnResize = states.onresize
    esm.esParent = states.parentNode

    // NOTE: If you're drilling elements, this WILL cause for infinite loop when drilling an object with getters
    if (esm.esElement instanceof Element) {
        esm.esElement.esComponent = esm
        esm.esElement.setAttribute('__isescomponent', '')
    }

    return element;
}

