import * as core from './core/index'


// Loaders
import * as compose from "./loaders/compose"
import * as element from "./loaders/element"
import * as define from "./loaders/define"
import * as start from "./loaders/start"
import * as stop from "./loaders/stop"
import { isNode } from './globals'
import { ConfigInput, Loaders } from './types'
import { Options } from '../../common/types'

// --------- Specifying Loaders ---------
const standardLoaders: Loaders = []

// Object Composition
standardLoaders.push(compose)

// DOM Elements
if (!isNode) standardLoaders.push(element, define)

// Lifecycle Functions
standardLoaders.push(start, stop)

// Allow editing core loaders
export const loaders = standardLoaders

// Exports from Core
export const monitor = core.monitor // Monitor any object for changes
export const resolve = core.resolve // Apply a callback to promises and direct references
export const clone = core.clone // Deep clone an object without creating an ES Component
export const merge = core.merge // Merge two objects together without creating an ES Component 

// Exports Modified from Core
export const create = (config: ConfigInput, toApply?: any, options: Partial<Options> = {}) => {

    // Merge Default Loaders
    if (options.loaders) options.loaders = Array.from(new Set([...options.loaders, ...standardLoaders]))
    else options.loaders = standardLoaders

    // Create the Component
    return core.create(config, toApply, options)
}
export default create