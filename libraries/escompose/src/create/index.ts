import * as element from './element'
import * as component from "./component";


const animations = {}

export default (id, esm, parent?) => {

        // ------------------ Register Components ------------------
        let registry = esm.esDefine ?? {}
        for (let key in registry) {
            const esm = registry[key]
            const info = esm.esElement
            if (info.name && info.extends) component.define(info, esm)
        }
    
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

            // Run as an Animation
            if (esm.esAnimate) {
                let original = esm.esAnimate

                const id = Math.random()
                const interval = (typeof original === 'number') ? original : 'global'

                if (!animations[interval]) {
                
                    const info = animations[interval] = {objects: {id: esm}} as any

                    const objects = info.objects
                    const runFuncs = () => {
                        for (let key in objects) objects[key].default()
                    }

                    // Global Animation Frames
                    if (interval === 'global') {
                        const callback = () => {
                            runFuncs()
                            info.id = window.requestAnimationFrame(callback)
                        }

                        callback()

                        animations[interval].stop = () => window.cancelAnimationFrame(info.id)
                    }
                    // Set Interval
                    else {
                        info.id = setInterval(() => runFuncs(), 1000/interval)
                        animations[interval].stop = () => clearInterval(info.id)
                    } 
                } 
                
                // Add to Objects
                else animations[interval].objects[id] = esm

                esm.esAnimate =  {
                    id,
                    original,
                    stop: () => {
                        delete animations[interval].objects[id]
                        esm.esAnimate = original
                        if (Object.keys(animations[interval].objects).length === 0) {
                            animations[interval].stop()
                            delete animations[interval]
                        }
                    }
                }
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
