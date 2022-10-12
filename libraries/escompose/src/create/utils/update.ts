import { ESComponent } from "../../component";

export default (id: string, esm: ESComponent, parent?:ESComponent) => {
    if(!esm.id && id) esm.id = id;
    if(!esm.id) esm.id = `${esm.tagName ?? 'element'}${Math.floor(Math.random()*1000000000000000)}`;

    if (esm.element instanceof Element) {
        let p = esm.parentNode;
        
        const parentEl = (parent?.element instanceof Element) ? parent.element : undefined;
        esm.parentNode = p ? p : parentEl;
    
            esm.element.id = esm.id;

            if(esm.attributes) {
                for (let key in esm.attributes) {
                    if(typeof esm.attributes[key] === 'function') esm.element[key] = (...args) => esm.attributes[key](...args); // replace this scope
                    else esm.element[key] = esm.attributes[key];
                }
            }

            if (esm.element instanceof HTMLElement) {
                if(esm.style) Object.assign(esm.element.style, esm.style);
            }
    }

    return esm
}