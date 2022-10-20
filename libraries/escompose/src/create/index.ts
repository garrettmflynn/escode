import * as element from './element'

export default (id, esm, parent?) => {
    
        // ------------------ Produce a Complete ESM Element ------------------
        let el = element.create(id, esm, parent);
        esm.esElement = el

        // ------------------ Declare Special Functions ------------------
        // Delete Function
        const onInit = esm.esInit;
        esm.esInit = () => {

            // Start Nested Components
            for (let name in esm.esComponents) {
                const init = esm.esComponents[name].esInit
                if (typeof init === 'function') init()
                else console.error(`Could not start component ${name} because it does not have an esInit function`)
            }

            // Trigger Execution on Initialization
            if (esm.hasOwnProperty('esTrigger')) {
                if (!Array.isArray(esm.esTrigger)) esm.esTrigger = []
                esm.default(...esm.esTrigger)
                delete esm.esTrigger
            }

            const context = esm.__esProxy ?? esm
            if (onInit) onInit.call(context)

        }

        esm.esDelete = function () {
            if ( this.esElement instanceof Element) {
                this.esElement.remove(); 
                if( this.onremove) {
                    const context = esm.__esProxy ?? esm
                    this.onremove.call(context); 
                }
            }
        }

        // -------- Bind Functions to GraphNode --------
        for (let key in esm) {
            if (typeof esm[key] === 'function') {
                const desc = Object.getOwnPropertyDescriptor(esm, key)
                if (desc && desc.get && !desc.set) esm = Object.assign({}, esm) // Support ESM Modules: Only make a copy if a problem
                const og = esm[key]
                esm[key] = (...args) =>  {
                    const context = esm.__esProxy ?? esm
                    return og.call(context, ...args)
                }
            }
        }

        Object.defineProperty(esm, '__isESComponent', {
            value: true,
            enumerable: false
        })    

        return esm;
}
