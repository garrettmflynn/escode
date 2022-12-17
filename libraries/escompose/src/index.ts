import Monitor from "../../esmonitor/src"
import { deep as deepClone } from "../../common/clone.js"
import * as standards from "../../esc/standards"
import { Options } from "../../common/types"
import * as utils from "./utils/misc"
import FlowManager from "../../drafts/edgelord/index"

import handleHierarchy from './loaders/native/esc/hierarchy'
import compose from './loaders/native/compose'

// Use a global monitor instance to listen to an object property without creating an ES Component 
export const monitor = new Monitor()

// Merge two objects together without creating an ES Component 
export const merge = (objects, updateOriginal) => {
    let base = objects.shift()
    objects.forEach(o => base = utils.merge(base, o, [], updateOriginal))
    return base
}


export const create = (config, toApply:any = {}, options: Partial<Options> = {}) => {

    // -------------- Support Multiple Configuration Types --------------   
    const typeOf = typeof config    

    // DOM NodeList Support (e.g. from querySelectorAll)
    if (config instanceof NodeList) config = Array.from(config)
    
    // String Resolution
    if (typeOf === 'string') config =  { [standards.specialKeys.apply]: config } // Compile string to object

    // Apply Component to the Element
    else if (config instanceof Element) {
        const component = config[standards.specialKeys.component]

        // Directly Merge into existing element + component pairs (TO FINISH)
        if (component) {

            toApply = deepClone(toApply) // Clone the applied object to prevent mutation

            // We cannot handle the compose and apply keywords the same way—so we will approximate here.
            const shouldHaveComposed = toApply.__compose
            const shouldHaveApplied = toApply.__apply
            delete toApply.__compose
            delete toApply.__apply

            if (shouldHaveComposed) {
                console.warn('Cannot compose a component onto an element that already has a component. Merging with the base object instead...')
                toApply = Object.assign(shouldHaveComposed, toApply)
            }

            if (shouldHaveApplied) {
                console.warn('Cannot apply a component onto an element that already has a component. Applying to the base object instead...')
                toApply = Object.assign(toApply, shouldHaveApplied)
            }

            // Actually complete the reverse composition
            const composition = compose(component, toApply, component[standards.specialKeys.path], options, true)
            return utils.resolve(composition)
        }
        // Create new component with element as the base
        else {
            config = { [standards.specialKeys.element]: config } // Compile element to object
        }
    }

    // Bulk Operations
    else if (Array.isArray(config)) {
        return utils.resolve(config.map(o => create(o, toApply, options)))
    }

    // Failed Resolution
    else if (typeOf !== 'object') throw new Error(`Invalid configuration type: ${typeOf}. Expected object or string.`)    
    


    // -------------- Create Complete Options Object --------------         
    options = deepClone(options)
    let monitor;
    if (options.monitor instanceof Monitor) {
        monitor = options.monitor
        options.keySeparator = monitor.options.keySeparator // Inherit key separator
    } else {
        if (!options.monitor) options.monitor = {}
        if (!options.monitor.keySeparator) {
            if (!options.keySeparator) options.keySeparator = standards.keySeparator // Ensure key separator is defined
            options.monitor.keySeparator = options.keySeparator
        }
        options.monitor = new Monitor(options.monitor)
    }

    

    if (options.clone) config = deepClone(config) // NOTE: If this doesn't happen, the reference will be modified by the create function


    // Always fall back to __children
    options.monitor.options.fallbacks = [standards.specialKeys.hierarchy]

    const fullOptions = options as Options

        let instancePromiseOrObject;


        const onConnected = (instance) => {

            const noParent = !instance[standards.specialKeys.parent] // Do not wait if no parent is given (since the app is only ready when placed in the DOM)
            
            // Just return instance synchronously
            if (noParent) return instance

            // Ensure a promise output
            // else return new Promise(resolve => {
            //     return utils.resolve(instance[standards.specialKeys.start](), resolve)
            // })

            // Return synchronously unless the user requests a promise
            else {
                const startRes = instance[standards.specialKeys.start]()
                return utils.resolve(startRes, resolve)
            }

        }


        if (options.nested?.parent && options.nested?.name){
            // TODO: Figure out how to pass the path for real...
            instancePromiseOrObject = handleHierarchy(config, options.nested.name, toApply, options.nested.parent, undefined, fullOptions)
        } else {

            const id = Symbol('root')

            let listeners = {}
            instancePromiseOrObject = handleHierarchy(config, id, toApply, undefined, undefined, fullOptions, {
                [id]: (instance) => {
                    (options.monitor as Monitor).set(id, instance, fullOptions.listeners) // Setting root instance
                },
                onInstanceCreated: (absolutePath, instance) => {

                    // Set listeners as soon as possible
                    if (fullOptions.listen !== false) {
                        const to = instance[standards.specialKeys.listeners.value] ?? {}  // Uses to —> from syntax | Always set
                        const manager = listeners[absolutePath] = new FlowManager(to, absolutePath, {
                            id, instance, monitor: fullOptions.monitor, options: fullOptions
                        }) // Uses from —> to syntax
                        instance[standards.specialKeys.listeners.value] = to // Replace with listeners assigned (in case of unassigned)

                        
                        // Declaring manager
                        Object.defineProperty(instance, standards.specialKeys.flow, {
                            value: manager,
                            enumerable: false,
                            writable: false
                        })

                        // -------- Trigger Execution when Ready --------
                        if (standards.specialKeys.trigger in instance) {
                            if (!Array.isArray(instance[standards.specialKeys.trigger])) instance[standards.specialKeys.trigger] = []
                            const args = instance[standards.specialKeys.trigger]
                            manager.onStart(() => instance.default(...args))
                            delete instance[standards.specialKeys.trigger]
                        }

                    }
                },
                onInstanceReady: (absolutePath) => {
                    listeners[absolutePath].start()
                }
            })
        }

        const res = utils.resolve(instancePromiseOrObject, onConnected)
        return res
}

export default create

export const clone = deepClone
export const resolve = utils.resolve