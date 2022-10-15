import * as element from './element'

export default (id, esm, parent?) => {
    
        // ------------------ Produce a Complete ESM Element ------------------
        let el = element.create(id, esm, parent);

        // TODO: Delcare all internal properties here...so you can update the UI in real-time
        // Listen for Changes to Element

        Object.defineProperty(esm, 'esElement', {
            get: function() {
                if (el instanceof Element) return el
            },
            set: function(v) {

                console.log('Setting element', v)
                if (v instanceof Element) {
                    el = v

                    // TODO: Fix so that this triggers the parentNode setter...
                    for (let name in esm.esComponents) {
                        const component = esm.esComponents[name]
                        component.parentNode = v
                    }
                }
            },
            enumerable:true,
            configurable: false
        })

        esm.esElement = el

        const parentNode = esm.parentNode;
        delete esm.parentNode;
        Object.defineProperty(esm, 'parentNode',{
            get:function () { 
                if (esm.esElement instanceof Element) return esm.esElement.parentNode; 
            },
            set:(v) => { 

                if (typeof v === 'string') {
                    const newValue = document.querySelector(v);
                    if (newValue) v = newValue
                    else v = document.getElementById(v);
                }

                if (v?.esElement instanceof Element) v = v.esElement
                if (esm.esElement instanceof Element) {
                    console.log('Setting parent node', esm, v)
                    if(esm.esElement.parentNode) esm.esElement.remove()
                    if (v) {
                        v.appendChild(esm.esElement);
                    }
                } 
                
                // Set Child Parent Nodes to This
                else {
                    for (let name in esm.esComponents) {
                        const component = esm.esComponents[name]
                        console.log('Setting Parent Node', name, component)
                        component.parentNode = v
                    }
                }
            },
            enumerable:true
        });

        esm.parentNode = parentNode

        // Delete Function

        const onInit = esm.esInit;
        esm.esInit = () => {

            // Start Nested Components
            for (let name in esm.esComponents) {
                const init = esm.esComponents[name].esInit
                if (init instanceof Function) init()
                else console.error(`Could not start component ${name} because it does not have an esInit function`)
            }

            // Trigger Execution on Initialization
            if (esm.hasOwnProperty('esTrigger')) {
                esm.default(esm.esTrigger)
                delete esm.esTrigger
            }

            if (onInit) onInit.call(esm)

        }

        esm.esDelete = function () {
            if ( this.esElement instanceof Element) {
                this.esElement.remove(); 
                if( this.onremove) this.onremove.call(this); 
            }
        }

        // On Resize Function
        let onresize = esm.esOnResize
        let onresizeEventCallback: any = null
        Object.defineProperty(esm,'esOnResize',{
            get: function() { return onresize },
            set: function(foo) {
                onresize = onresize
                if (onresizeEventCallback) window.removeEventListener('resize', onresizeEventCallback) // Stop previous listener
                if (onresize) {
                    onresizeEventCallback = (ev) => { 
                        if ( onresize && esm.esElement instanceof Element ) foo.call(this, ev) 
                    };
                    window.addEventListener('resize', onresizeEventCallback);
                }
            },
            enumerable: true
        })

        esm.esOnResize = onresize


    
        // NOTE: If you're drilling elements, this WILL cause for infinite loop when drilling an object with getters
        if (esm.esElement) esm.esElement.component = esm; // Bind component to the element
        
        // -------- Bind Functions to GraphNode --------
        let initialesm = esm._initial ?? esm
        for (let key in initialesm) {
            if (typeof initialesm[key] === 'function') {
                const desc = Object.getOwnPropertyDescriptor(initialesm, key)
                if (desc && desc.get && !desc.set) initialesm = Object.assign({}, initialesm) // Support ESM Modules: Only make a copy if a problem
                const og = initialesm[key]
                initialesm[key] = (...args) =>  og.call(esm, ...args)
            } else if (key === 'attributes') {
                for (let key2 in initialesm.attributes) {
                    if (typeof initialesm.attributes[key2] === 'function') {
                        const og = initialesm.attributes[key2]
                        initialesm.attributes[key2] = (...args) =>  og.call(esm, ...args)
                    }
                }
            }
        }

        Object.defineProperty(esm, '__isESComponent', {
            value: true,
            enumerable: false
        })    


        if (esm.esOnCreate) esm.esOnCreate.call(esm)

        return esm;
}
