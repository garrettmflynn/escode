import Monitor from "../esmonitor/src/index"
import { deep as deepClone } from "../common/clone.js"
import { Options } from "../common/types"
import * as utils from "../common/utils"

import { ConfigInput } from "./types"
import load from "./load"

import * as components from "./components"

import { specialKeys } from "../../../spec/properties"
import ESComponent from "../../esc.spec"

// Default Loaders
import * as listenerLoader from "./escode-listeners-loader"
import * as childrenLoader from "./escode-trigger-loader"
import { combineLoaders } from "./utils/loaders"

// Use a global monitor instance to listen to an object property without creating an ES Component 
export const monitor = new Monitor()

// This function is the user interface for creating ES Components
export const create = (
    config: ConfigInput, // This is a configuration object, which can be many things
    overrides: any = {}, // This is an object that is applied to resulting objects from the configuration object
    options: Partial<Options> = {}, // There are a few options that the user can set to configure their Components
) => {

    const copy = deepClone(options) as Options // Clone the options object
    copy.loaders = combineLoaders(copy.loaders, [listenerLoader, childrenLoader]) // Specify the loaders
    const fullOptions = copy as Options // Define as a complete options object

    // Load the component
    const component = load(config, fullOptions.loaders, {
        overrides,
        opts: fullOptions,
        waitForChildren: false
    })

    // Start the component after it has been properly instantiated
    return utils.resolve(component, (esc) => {
        const isArray = Array.isArray(esc)
        let arr = (!isArray) ? [esc] : esc

        // Activate if it has a parent—or it is the root
        arr.map(esc => {
            if (esc[specialKeys.parent] || esc.__.path === '') {
                const configuration = esc[specialKeys.root]
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
