import Component from '../index';
import * as element from './element'
import * as clone from "../../../common/clone.js"

export default (id, esm, parent) => {
    
        esm = clone.deep(esm);

        // ------------------ Produce a Complete ESM Element ------------------
        esm = element.add(id, esm, parent);

        // ------------------ Produce a Component ------------------
        const component = new Component(
            esm,
            parent?.options,
            parent
        );
    
        esm.element.component = component; // Bind component to the element
        
        // -------- Bind Functions to GraphNode --------
        let initialesm = esm._initial ?? esm
        for (let key in initialesm) {
            if (typeof initialesm[key] === 'function') {
                const desc = Object.getOwnPropertyDescriptor(initialesm, key)
                if (desc && desc.get && !desc.set) initialesm = Object.assign({}, initialesm) // Support ESM Modules: Only make a copy if a problem
                initialesm[key] = initialesm[key].bind(component)
            } else if (key === 'attributes') {
                for (let key2 in initialesm.attributes) {
                    if (typeof initialesm.attributes[key2] === 'function') {
                        initialesm.attributes[key2] = initialesm.attributes[key2].bind(component)
                    }
                }
            }
        }
    
        return component;
}
