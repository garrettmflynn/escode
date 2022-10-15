import { ESComponent } from "../component";

export function create(id, esm: ESComponent, parent) {

    if (!esm.id && id) esm.id = id;
    if (typeof esm.id !== 'string') esm.id = `${esm.tagName ?? 'element'}${Math.floor(Math.random() * 1000000000000000)}`;

    // --------------------------- Get Element ---------------------------
    let element = esm.esElement;
    if (element) {
        if (typeof element === 'string') {
            const elm = document.querySelector(element); //get first element by tag or id 
            if (!elm) {
                const elm = document.getElementById(element);
                if (elm) element = elm;
            } else element = elm;
        }
    }
    else if (esm.tagName) element = document.createElement(esm.tagName);
    else if (esm.id) {
        const elm = document.getElementById(esm.id);
        if (elm) element = elm;
    }

    if (!(element instanceof Element)) console.warn('Element not found for', id);

    // --------------------------- Assign Things to Element ---------------------------

    if (element instanceof Element) {
        let p = esm.parentNode;

        const parentEl = (parent?.esElement instanceof Element) ? parent.esElement : undefined;
        esm.parentNode = p ? p : parentEl;

        element.id = esm.id;

        if (esm.attributes) {
            for (let key in esm.attributes) {
                if (typeof esm.attributes[key] === 'function') element[key] = (...args) => esm.attributes[key](...args); // replace this scope
                else element[key] = esm.attributes[key];
            }
        }

        if (element instanceof HTMLElement) {
            if (esm.style) Object.assign(element.style, esm.style);
        }
    }

    return element;
}

