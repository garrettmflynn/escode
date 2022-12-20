import * as core from './core/index'


// Loaders
import * as compose from "./loaders/compose"
import * as element from "./loaders/element"
import * as define from "./loaders/define"
import * as start from "./loaders/start"
import * as stop from "./loaders/stop"

// Default Loaders
const standardLoaders = [
    compose, // Load the composition
    element,
    define,
    start,
    stop
]

// Allow editing core loaders
export const loaders = standardLoaders

// Exports from Core
export const monitor = core.monitor // Monitor any object for changes
export const resolve = core.resolve // Apply a callback to promises and direct references
export const clone = core.clone // Deep clone an object without creating an ES Component
export const merge = core.merge // Merge two objects together without creating an ES Component 

// Exports Modified from Core
export const create = (config, toApply, options, loaders = standardLoaders) => core.create(config, toApply, options, loaders)
export default create