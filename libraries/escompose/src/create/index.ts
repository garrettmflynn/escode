import * as element from './element'
import * as component from "./component";
import * as standards from '../../../common/standards';
import * as clone from "../../../common/clone.js"
import { Options } from '../../../common/types';

const animations = {}

export default (id, esm, parent?, opts: Partial<Options> = {}) => {
    
        const states = {
            connected: false,
        }

        const copy = clone.deep(esm) // Start with a deep copy. You must edit on the resulting object...

        try {

            for (let name in esm.esDOM) {
                const value = esm.esDOM[name]
                const isUndefined = value == undefined
                const type = (isUndefined) ? JSON.stringify(value) : typeof value
                if (type != 'object') {
                    console.error(`Removing ${name} esDOM field that which is not an ES Component object. Got ${isUndefined ? type :`a ${type}`} instead.`)
                    delete esm.esDOM[name]
                }
            }

            // ------------------ Register Components ------------------
            let registry = esm.esComponents ?? {}
            for (let key in registry) {
                const esm = registry[key]
                const info = esm.esElement
                if (info.name && info.extends) component.define(info, esm)
            }

        
            // ------------------ Produce a Complete ESM Element ------------------

            let el = element.create(id, esm, parent, states, opts.utilities);

            const finalStates = states as element.ESComponentStates
            
            esm.esElement = el

            // ------------------ Declare Special Functions ------------------

            const esConnectedAsync = async (onReadyCallback) => {

                let toRun: any[] = []
                await esm.esReady

                states.connected = true

                // Initialize Nested Components (and wait for them to be done)
                for (let name in esm.esDOM) {
                    let component = esm.esDOM[name]
                    if (typeof component === 'object' && typeof component.then === 'function' ) component = esm.esDOM[name] = await component
                    const init = component.esConnected
                    if (typeof init === 'function') toRun.push(...await init())
                    else console.error(`Could not start component ${name} because it does not have an esConnected function`)
                }

                if (onReadyCallback) await onReadyCallback()

                // Trigger Execution on Initialization
                if ('esTrigger' in esm) {
                    if (!Array.isArray(esm.esTrigger)) esm.esTrigger = []
                    toRun.push({
                        ref: esm,
                        args: esm.esTrigger
                    })
                    delete esm.esTrigger
                }

                return toRun
            }

            const esConnectedMain = () => {
                
                // Retroactively setting the esCode editor on children of the focus element
                const esCode = esm.esParent?.esComponent?.__esCode
                if (esCode) esm.__esCode = esCode

                // ------------------ Register Sources (from esmpile)- -----------------
                let source = esm[standards.esSourceKey]
                if (source) {
                    if (typeof source === 'function') source = esm.esSource = source()
                    delete esm[standards.esSourceKey]
                    const path = esm.__isESComponent
                    if (esm.__esCode) esm.__esCode.addFile(path, source)
                }


                // Call After Children + Before Running (...TODO: Is this right?)
                const context = esm.__esProxy ?? esm
                if (ogInit) ogInit.call(context)

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
                            runFuncs() // run initially
                            info.id = setInterval(() => runFuncs(), 1000/interval)
                            animations[interval].stop = () => clearInterval(info.id)
                        } 
                    } 
                    
                    // Add to Objects
                    else {
                        esm.default() // run initially
                        animations[interval].objects[id] = esm
                    }


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
            }

            // Delete Function
            const ogInit = esm.esConnected;
            esm.esConnected = (onReadyCallback?: Function) => {

                // Ensure asynchronous loading
                if (opts.await) {
                    return esConnectedAsync(async () => {
                        if (onReadyCallback) await onReadyCallback() // Callback when then entire object is ready
                        esConnectedMain()
                    })
                } 
                
                // Default to attempted synchronous loading
                else {
                    const toRun = esConnectedAsync(onReadyCallback)
                    esConnectedMain()
                    return toRun
                }
            }

            const ogDelete = esm.esDisconnected;
            esm.esDisconnected = function () {

                if ( this.esAnimate && typeof this.esAnimate.stop === 'function') this.esAnimate.stop()

                // Clear all listeners below this node
                if (this.esListeners) this.esListeners.__manager.clear()

                // Clear all listeners above this node that reference it
                let target = this
                while (target.esParent?.hasAttribute('__isescomponent')) {
                    target = target.esElement.parentNode.esComponent
                    if (target.esListeners?.__manager) target.esListeners.__manager.clear(this.__isESComponent)
                }

                if (this.esDOM) {
                    for (let name in this.esDOM) {
                        const component = this.esDOM[name]
                        if (typeof component.esDisconnected === 'function') component.esDisconnected()
                        else console.warn('Could not disconnect component because it does not have an esDisconnected function', name, this.esDOM)
                    }
                }

                // Remove Element
                if ( this.esElement instanceof Element) {
                    this.esElement.remove();
                    if(this.onremove) {
                        const context = this.__esProxy ?? this
                        this.onremove.call(context); 
                    }
                }

                // Remove code editor
                if (this.__esCode) this.__esCode.remove() 

                const context = this.__esProxy ?? this
                if (ogDelete) ogDelete.call(context)

                // Replace Updated Keywords with Original Values
                this.esConnected = ogInit
                this.esDisconnected = ogDelete
                return this
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

        } catch (e){ 
            console.error(`Failed to create an ES Component (${typeof id === 'string' ? id : id.toString()}):`, e)
            return copy
        }
}
