import { isNativeClass, merge, resolve } from '../common/utils/index'
import { all } from "../common/properties"
import { specialKeys } from "../../spec/standards"
import parse from "./parse"
import { ApplyOptions, Loaders } from "./types"
import { toReturn } from "./symbols"
import { ESComponent } from "../../spec"

import { sortLoaders, runLoaders } from './utils/loaders'

import * as components from "./components"

// Native Loaders
import * as propsLoader from "./loaders/props"
import * as parentLoader from "./loaders/parent"
import rootLoader from './loaders/drafts/root'

export default function load(esc, loaders: Loaders = [], options: ApplyOptions): ESComponent {
    
    const tic = performance.now()


    const parent = options.parent // Don't proxy the window...
    const {
        parentObject,
        overrides = {},
        callbacks = {},
        opts = {},
        name = Symbol('root'), // Create symbol to identify the root instance
    } = options as ApplyOptions

    // Track the original component structure
    const original = esc

    // Parse the configuration object into a final configuration object
    esc = parse(esc, overrides, opts)

    // Shortcut to return an existing (but updated) component
    if (esc[toReturn]) return esc[toReturn] 

    // Return bulk operation requests
    if (Array.isArray(esc)) return resolve(esc.map(o => load(o, loaders, options)))

    // ------------- Main Load Sequence -------------
    esc = rootLoader(esc, options, { name, parent, original, loaders }) // Set root property
    esc = merge(esc, overrides) // Merge with overrides

    // First round of loaders
    const sortedLoaders = sortLoaders(loaders)
    const loaded = runLoaders(sortedLoaders, { main: esc, overrides: overrides, options: opts }, 'load') // Complete component resolution

    const component = resolve(loaded, loaded => {

        // Parent Loader
        if (!loaded[specialKeys.parent] && parent)  loaded[specialKeys.parent] = parent // This is currently required...
        const parented = runLoaders([parentLoader], { main: loaded, options: opts }) // Use original parent here (in case none are specified later)

        // Props Loader
        const propped = runLoaders([propsLoader], { main: parented }) // Use original parent here (in case none are specified later)

        // Second round of loaders
        const res = runLoaders(sortedLoaders, { main: propped, options: opts }, 'activate') // Recognize all special keys

        return resolve(res, (esc) => {

            esc.__.ref = esc

            // -------- Set Resolved Component --------
            if (parentObject) parentObject[name] = esc // setting immediately

            // On Creation Callbacks
            if (typeof name === 'symbol' && callbacks.onRootCreated) callbacks.onRootCreated(name, esc)
            if (callbacks.onInstanceCreated) callbacks.onInstanceCreated(esc.__.path, esc)

            const configuration = esc[specialKeys.isGraphScript]

            // Resolve Nested Components
        const nested = components.from(propped)

        const promises = (nested) ? nested.map((info) => {
            const copy = Object.assign({}, options)
            const name = copy.name = info.name
            delete copy.overrides // Only apply to the root node
            copy.parentObject = info.parent
            copy.parent = esc

            const ref = info.ref

            // TODO: Reinstate the ability to define child position on the node (in case it is confused...)
            if (ref) {

                // Existing ES Component (reparent)
                if (ref.__?.symbol) {
                    const parent = ref.__.parent
                    if (parent) console.error(`Changing parent of existing component (${ref.__.path}) from ${parent.__.path} to ${configuration.path}`)
                    ref.__.name = name // Update the name of a component. TODO: Make sure to check for side-effects
                    ref.__parent = esc
                } 
                
                // New Component Template (load)
                else {
                    const resolution = load(ref, loaders, copy) // Apply loaders to nested components

                    // Allow users to await the resolution of all children
                    Object.defineProperty(info.parent[name], specialKeys.promise, { value: resolution, writable: false, })

                    const promise = resolve(resolution, (res) => {
                        configuration.components.set(name, res)
                        return res
                    })

                    configuration.components.set(name, promise)
                }
            } else {
                delete info.parent[name]
                console.error('No reference found for nested component', info)
            }
        }) : []

            // Allow the user to wait until all the chidren are resolved by awaiting the promise
            let isResolved
            const resolvePromise = new Promise(resolve => isResolved = async () => {
                configuration.resolved = true
                resolve(true)
            })

            Object.defineProperty(esc, `${specialKeys.resolved}`, { value: resolvePromise })
            configuration.resolved = false // To resolve the promise

            // Signal that the component is ready
            resolve(promises, () => isReady(esc, callbacks, isResolved))

            // Return the esc object
            return esc
        })
    })

    // Track Performance
    const creationToc = performance.now()
    const toCreateTime = creationToc - tic

    resolve(component, (esc) => {
        if (!Array.isArray(esc)) {
            const resolveToc = performance.now()
            const resolveTime = resolveToc - tic
            resolve(esc.__resolved, () => {
                const toc = performance.now()
                const resolveAllTime = toc - tic
                globalThis.escomposePerformance.resolve.push(resolveTime)
                globalThis.escomposePerformance.resolveAll.push(resolveAllTime)
                globalThis.escomposePerformance.create.push(toCreateTime)

            })
        }
    })

    // Return the resolved component
    return component
}

    // On Ready Callback
    function isReady (esc, callbacks, isResolved) {

        const configuration = esc[specialKeys.isGraphScript]

        // -------- Bind Functions to Node --------
        for (let key in esc) {
            const og = esc[key]
            if (typeof og === 'function' && !isNativeClass(og)) {
                const context = esc[specialKeys.proxy] ?? esc
                // const og = esc[key]
                esc[key] = og.bind(context)
            }
        }

        // Add Stop Method
        configuration.stop.initial = esc[specialKeys.stop]
        esc[specialKeys.stop] = configuration.stop.run


        // Ensure all GraphScript properties are non-enumerable
        // And bind all functions to the node
        const keys = all(esc)

        for (let key of keys) {
            if (components.is(key)) {
                const desc = Object.getOwnPropertyDescriptor(esc, key)
                if (desc?.enumerable) Object.defineProperty(esc, key, { ...desc, enumerable: false })
            }

            // if (typeof esc[key] === 'function') esc[key] = esc[key].bind(esc) // ensure all functions are bound to the node
        }

        // Trigger Parent / Path Loader
        const finalParent = esc[specialKeys.parent]
        esc[specialKeys.parent] = finalParent

        if (callbacks.onInstanceReady) callbacks.onInstanceReady(esc.__.path, esc)

        isResolved()
    }