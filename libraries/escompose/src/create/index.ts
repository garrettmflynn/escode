import * as element from './element'
import * as component from "./component";
import * as standards from '../../../common/standards';
import * as clone from "../../../common/clone.js"
import { Options } from '../../../common/types';


const animations = {}

export default (id, esm, parent?, utilities: Options['utilities'] = {}) => {

        const copy = clone.deep(esm) // Start with a deep copy. You must edit on the resulting object...

        // ------------------ Register Components ------------------
        let registry = esm.esComponents ?? {}
        for (let key in registry) {
            const esm = registry[key]
            const info = esm.esElement
            if (info.name && info.extends) component.define(info, esm)
        }
    
        // ------------------ Produce a Complete ESM Element ------------------
        const states = {}
        let el = element.create(id, esm, parent, states,  utilities);

        const finalStates = states as element.ESComponentStates
        
        esm.esElement = el

        // ------------------ Declare Special Functions ------------------
        // Delete Function
        const ogInit = esm.esConnected;
        esm.esConnected = async () => {

            await esm.esReady

            // Start Nested Components
            for (let name in esm.esDOM) {
                const init = esm.esDOM[name].esConnected
                if (typeof init === 'function') init()
                else console.error(`Could not start component ${name} because it does not have an esConnected function`)
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
                
                    const info = animations[interval] = {objects: {[id]: esm}} as any

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

                        animations[interval].stop = () => {
                            window.cancelAnimationFrame(info.id)
                            info.cancel = true
                        }
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
                        esm.esAnimate = original // Replace with original function
                        if (Object.keys(animations[interval].objects).length === 0) {
                            animations[interval].stop()
                            delete animations[interval]
                        }
                    }
                }
            }

            const context = esm.__esProxy ?? esm
            if (ogInit) ogInit.call(context)
        }

        const ogDelete = esm.esDisconnected;
        esm.esDisconnected = function () {

            if ( this.esElement instanceof Element) {
                this.esElement.remove(); 
                if( this.onremove) {
                    const context = esm.__esProxy ?? esm
                    this.onremove.call(context); 
                }
            }

            if ( esm.esAnimate && typeof esm.esAnimate.stop === 'function') esm.esAnimate.stop()
            if (esm.esListeners) esm.esListeners.__manager.clear()

            if (esm.esDOM) {
                for (let name in esm.esDOM) esm.esDOM[name].esDisconnected()
            }

            if (esm.__esCode) esm.__esCode.remove() // Remove code editor

            const context = esm.__esProxy ?? esm
            if (ogDelete) ogDelete.call(context)

            // Replace Updated Keywords with Original Values
            esm.esConnected = ogInit
            esm.esDisconnected = ogDelete

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

        const isESC = {value: '', enumerable: false} as any
        if (typeof id === 'string') {
            if (parent?.__isESComponent) isESC.value = [parent.__isESComponent, id]
            else isESC.value = [id]
            isESC.value = isESC.value.join(standards.keySeparator)
        }

        Object.defineProperty(esm, '__isESComponent', isESC)    
        Object.defineProperty(esm, 'esOriginal', {value: copy, enumerable: false})    

        // Trigger state changes at the end
        esm.esOnResize = finalStates.onresize
        esm.esParent = finalStates.parentNode

        return esm;
}
