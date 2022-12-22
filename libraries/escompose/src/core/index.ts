import Monitor from "../../../esmonitor/src"
import { deep as deepClone } from "../../../common/clone.js"
import { specialKeys } from "../../../esc/standards"
import { Options } from "../../../common/types"
import * as utils from "../utils"

import { parseOptions } from "./parse"
import { ConfigInput } from "../types"
import load from "./load"

import * as components from "./components"
import { ESComponent } from "../../../esc"
import './globals'

// Use a global monitor instance to listen to an object property without creating an ES Component 
export const monitor = new Monitor()

// This function is the user interface for creating ES Components
export const create = (
    config: ConfigInput, // This is a configuration object, which can be many things
    toApply: any = {}, // This is an object that is applied to resulting objects from the configuration object
    options: Partial<Options> = {}, // There are a few options that the user can set to configure their Components
) => {

    // Parse the options object into a final options object
    const fullOptions = parseOptions(options)

    const callbacks = {

        onRootCreated: (id, esc) => (fullOptions.monitor as Monitor).set(id, esc, fullOptions.listeners), // Setting root instance

        onInstanceCreated: (absolutePath, esc) => {

            // Set listeners as soon as possible
            if (fullOptions.listen !== false) {
                const to = esc[specialKeys.listeners.value] ?? {}  // Uses to —> from syntax | Always set

                const flow = esc[specialKeys.isGraphScript].flow
                flow.setInitialProperties(to, absolutePath, {
                    id: esc[specialKeys.isGraphScript].graph,
                    monitor: fullOptions.monitor,
                    options: fullOptions
                })

                esc[specialKeys.listeners.value] = to // Replace with listeners assigned (in case of unassigned)


                // -------- Trigger Execution when Ready --------
                if (specialKeys.trigger in esc) {
                    if (!Array.isArray(esc[specialKeys.trigger])) esc[specialKeys.trigger] = []
                    const args = esc[specialKeys.trigger]
                    flow.onStart(() => esc.default(...args))
                    delete esc[specialKeys.trigger]
                }
            }
        },

        // Activate listeners when instance is ready
        onInstanceReady: (absolutePath, esc) => esc[specialKeys.isGraphScript].flow.start(),
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
            if (
                esc[specialKeys.parent] // Must have a parent to be active
                || esc.__.path === ''   // OR be the root
            ) {
                const configuration = esc[specialKeys.isGraphScript]
                const hasStarted = configuration.start.value
                if (hasStarted === false) {
                    const onRun = configuration.start.run()
                    return utils.resolve(onRun, resolve) // Return synchronously unless the user requests a promise
                }

            } else return esc // Just return instance synchronously since the component is only activated when placed in the DOM
        })

        if (!isArray) return arr[0] as ESComponent
        else return arr as ESComponent[]
    }) as ESComponent

}

export default create


// Find components on an object
export const find = components.from

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
