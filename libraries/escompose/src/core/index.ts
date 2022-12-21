import Monitor from "../../../esmonitor/src"
import { deep as deepClone } from "../../../common/clone.js"
import { specialKeys } from "../../../esc/standards"
import { Options } from "../../../common/types"
import * as utils from "../utils"
import FlowManager from "../../../drafts/edgelord/index"

import { parseOptions } from "./parse"
import { ConfigInput, Loaders } from "../types"
import load from "./load"

// Use a global monitor instance to listen to an object property without creating an ES Component 
export const monitor = new Monitor()

// This function is the user interface for creating ES Components
export const create = (
    config: ConfigInput , // This is a configuration object, which can be many things
    toApply:any = {}, // This is an object that is applied to resulting objects from the configuration object
    options: Partial<Options> = {}, // There are a few options that the user can set to configure their Components
) => {

        // Parse the options object into a final options object
        const fullOptions = parseOptions(options) 

        let listeners = {}

        const callbacks = {

            onRootCreated: (id, esc) => (fullOptions.monitor as Monitor).set(id, esc, fullOptions.listeners), // Setting root instance
            
            onInstanceCreated: (absolutePath, esc) => {

                // Set listeners as soon as possible
                if (fullOptions.listen !== false) {
                    const to = esc[specialKeys.listeners.value] ?? {}  // Uses to —> from syntax | Always set

                    const manager = listeners[absolutePath] = new FlowManager(to, absolutePath, {
                        id: esc[specialKeys.isGraphScript].graph, 
                        monitor: fullOptions.monitor, 
                        options: fullOptions
                    }) // Uses from —> to syntax
                    esc[specialKeys.listeners.value] = to // Replace with listeners assigned (in case of unassigned)

                    
                    // Declaring manager
                    Object.defineProperty(esc, specialKeys.flow, {
                        value: manager,
                        enumerable: false,
                        writable: false
                    })

                    // -------- Trigger Execution when Ready --------
                    if (specialKeys.trigger in esc) {
                        if (!Array.isArray(esc[specialKeys.trigger])) esc[specialKeys.trigger] = []
                        const args = esc[specialKeys.trigger]
                        manager.onStart(() => esc.default(...args))
                        delete esc[specialKeys.trigger]
                    }
                }
            },

            // Activate listeners when instance is ready
            onInstanceReady: (absolutePath) => listeners[absolutePath].start()
        }

        const loaders = fullOptions.loaders
        const component = load(config, loaders, {
            toApply, 
            opts: fullOptions, 
            callbacks, 
            waitForChildren: false
        })

        return utils.resolve(component, (esc) => {
            const isArray = Array.isArray(esc)
            let arr = (!isArray) ? [esc] : esc
            arr.map(esc => {
                if (esc[specialKeys.parent]) {
                    const configuration = esc[specialKeys.isGraphScript]
                    const hasStarted = configuration.start.value
                    if (hasStarted === false) {
                        return utils.resolve(configuration.start.run(), resolve) // Return synchronously unless the user requests a promise
                    }

                } else return esc // Just return instance synchronously since the component is only activated when placed in the DOM
            })

            if (!isArray) return arr[0]
            else return arr

        })
}

export default create

// Apply a callback to promises and direct references
export const resolve = utils.resolve

// Deep clone an object without creating an ES Component
export const clone = deepClone

// Merge two objects together without creating an ES Component 
export const merge = (objects, updateOriginal) => {
    let base = objects.shift()
    objects.forEach(o => base = utils.merge(base, o, updateOriginal))
    return base
}
