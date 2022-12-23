import create from "./index"
import { isNativeClass, resolve } from '../common/utils/index'
import { all } from "../common/properties"
import { defaultProperties, keySeparator, specialKeys } from "../../spec/standards"
import parse from "./parse"
import { ApplyOptions, Loaders, SortedLoaders } from "./types"
import { toReturn } from "./symbols"
import { ESComponent } from "../../spec"
import FlowManager from "./edgelord/index"

import * as components from "./components"

// Native Loaders
import * as propsLoader from "./loaders/props"
import * as parentLoader from "./loaders/parent"




const run = (f, context, args, x?) => resolve(x, () => f.call(context, ...args))

const runSequentially = (callbacks: Function[], args: any[] = [], context?) => {
    if (callbacks.length) {
        if (callbacks.length === 1) run(callbacks[0], context, args)
        else return callbacks.reduce((x,f) => run(f, context, args, x))
    }

}

const compose = (callbacks, start, otherArgs: any[] = [], toIgnore: Function) => {
    return callbacks.reduce(
        (x, f) => resolve(x, (res) => {
            let func = (typeof f === 'function') ? f : f.default
            const output = func(res, ...otherArgs)
            return (toIgnore && toIgnore(output)) ? res : output
        }),
        start
    )
}

// Use a function composition technique run the loaders in order
const runLoaders = (loaders: Loaders | SortedLoaders, inputs: {
    main: any,
    overrides?: any,
    options?: any
}, which?) => {

    const { main, overrides, options } = inputs


    let preloaded: Loaders | undefined;
    if (!Array.isArray(loaders)) {
        if (!loaders[which]) return main
        const sorted = loaders as SortedLoaders
        loaders = sorted[which] ?? []
        switch (which) {
            case 'activate':
                preloaded = [...sorted.load ?? []]
                break
            case 'start':
                preloaded = [...sorted.load ?? [], ...sorted.activate ?? []]
            case 'stop':
                preloaded = [...sorted.load ?? [], ...sorted.activate ?? [], ...sorted.start ?? []]
                break
        }
    }

    const resolvedLoaders = loaders as Loaders

    const loadersToUse = filterLoaders(main, resolvedLoaders, preloaded) // Check which loaders are needed

    if (loadersToUse) return compose(loadersToUse, main, [overrides, options], (output) => !output || typeof output !== 'object')
    else return main
}
const sortLoaders = (loaders: Loaders) => {
    const sorted: Partial<SortedLoaders> = {}
    loaders.forEach(o => {
        const behavior = (typeof o === 'function') ? 'activate' : o.behavior ?? 'activate'
        const theseLoaders = sorted[behavior] = sorted[behavior] ?? []
        theseLoaders.push(o)
    })

    return sorted as SortedLoaders

}

// TODO: Add a way to move this after the composition loader.
// This will require defining specific keys on the loaders object to determine the order of execution

const filterLoaders = (esc, loaders: Loaders, beenLoaded: Loaders = []) => {

    const keys = all(esc).filter(str => str.slice(0, 2) === '__') // Grab used keys

    const defaultPropertiesCopy = Object.values(defaultProperties)
    const created = [...defaultPropertiesCopy, ...beenLoaded.map(o => {
        if (typeof o === 'function') return []
        else return o.properties.dependents
    }).flat()] // Assume these are created

    const usedLoaders = loaders.filter(o => {
        if (o && typeof o === 'object') {
            const name = o.name
            const { dependencies, dependents = [] } = o.properties
            let include = o.required || !dependencies
            if (!include && dependencies) {
                const optionalNameMessage = name ? ` (${name})` : ''
                const found = dependents.find(key => keys.includes(key))
                if (found) {
                    const deps = {}
                    dependencies.forEach((key) => deps[key] = created.includes(key))
                    const missingDependency = dependencies.filter((key) => !created.includes(key))
                    if (missingDependency.length) console.warn(`The loader${optionalNameMessage} for ${dependencies.join(', ')} might be loaded too early, since we are missing the following dependencies: ${missingDependency.join(', ')}`)
                    include = true
                }
                // else console.warn(`Ignoring the loader${optionalNameMessage ?? ` for: ${dependencies.join(', ')}`}`)
            }

            if (include && dependents) created.push(...dependents)

            return include
        }
    })

    return usedLoaders
}

function addCallback(callback, priority: 'before' | 'after' | 'main' = 'main') {
    const { callbacks } = this
    callbacks[priority].push(callback)
    return true
}

function runRecursive(resolved) {
    const { callbacks, name } = this


    if (!this.value) {

        const isStop = name === 'stop'
        const configuration = resolved[specialKeys.isGraphScript]

        const callback = isStop ? configuration.stop.initial : resolved[specialKeys[name]]
        this.value = true


        if (!isStop) configuration.stop.value = false

        const toCall = (callback && !isStop) ? [...callbacks.before, callback, ...callbacks.main] : [...callbacks.before, ...callbacks.main]

        const result = runSequentially(toCall, [resolved], resolved)
        return resolve(result, () => {

            const hierarchy = Array.from(resolved[specialKeys.isGraphScript].components.entries()) as [string, ESComponent][]

            // Initialize Nested Components (and wait for them to be done)
            const ranOnChildren = resolve(hierarchy.map(async ([tag, component]) => {
                const promise = component[specialKeys.promise]
                if (promise && typeof promise.then === 'function') component = hierarchy[tag] = await promise // Wait for the component to be ready

                return await component[specialKeys.isGraphScript][name].run() // Run the component start / stop function
            }))

            return resolve(ranOnChildren, () => {

                // After All Components Resolved
                const result = runSequentially(callbacks.after, [resolved], resolved)
                return resolve(result, () => {

                    // Call Final Function or Return
                    if (isStop) {
                        if (callback) callback.call(resolved, resolved) // Run general stop function last

                        // Clear all listeners below esc node
                        configuration.flow.clear()

                        // Clear all listeners above the Component that reference it
                        const path = resolved[specialKeys.isGraphScript].path
                        let target = resolved
                        const parent = target[specialKeys.parent]
                        while (parent && parent[specialKeys.isGraphScript] !== undefined) {
                            const res = target[specialKeys.parent] // parent is a component
                            if (res) {
                                target = res
                                if (target) {
                                    const configuration = target[specialKeys.isGraphScript]
                                    if (configuration) configuration.flow.clear(path)
                                }
                            } else break
                        }



                        configuration.start.value = false // Can be restarted
                    }

                    return true
                })
            })
        })
    }
}


export default function load(esc, loaders: Loaders = [], options: ApplyOptions): ESComponent {
    
    const tic = performance.now()


    const parent = options.parent // Don't proxy the window...
    const {
        parentObject,
        toApply = {},
        callbacks = {},
        opts = {},
        name = Symbol('root'), // Create symbol to identify the root instance
    } = options as ApplyOptions

    // Track the original component structure
    const original = esc


    // Parse the configuration object into a final configuration object
    esc = parse(esc, toApply, opts)

    // Shortcut to return an existing (but updated) component
    if (esc[toReturn]) return esc[toReturn] 

    // Return bulk operation requests
    if (Array.isArray(esc)) return resolve(esc.map(o => load(o, loaders, options)))

    // Create root property
    esc[specialKeys.isGraphScript] = createGraphScriptRoot(name, options, { parent, original, loaders })

    const sortedLoaders = sortLoaders(loaders)
    const loaded = runLoaders(sortedLoaders, { main: esc, overrides: toApply, options: opts }, 'load') // Complete component resolution

    const component = resolve(loaded, loaded => {

        // Parent Loader
        let toApplyParent = (!loaded[specialKeys.parent] && parent) ? { [specialKeys.parent]: parent } : {}
        const parented = runLoaders([parentLoader], { main: loaded, overrides: toApplyParent, options: opts }) // Use original parent here (in case none are specified later)

        // Props Loader
        const propped = runLoaders([propsLoader], { main: parented }) // Use original parent here (in case none are specified later)


        const res = runLoaders(sortedLoaders, { main: propped, overrides: toApply, options: opts }, 'activate') // Recognize all special keys

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
            delete copy.toApply // Only apply to the root node
            copy.parentObject = info.parent
            copy.parent = esc

            const ref = info.ref

            // TODO: Reinstate the ability to define child position on the node (in case it is confused...)
            if (ref) {

                // Existing ES Component (reparent)
                if (ref.__?.symbol) {
                    const parent = ref.__.parent
                    if (parent) console.error(`Changing parent of existing component (${ref.__.path}) from ${parent.__.path} to ${configuration.path}`)
                    ref.__parent = esc
                    esc[specialKeys.isGraphScript].components.set(name, res)
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

function createGraphScriptRoot(name, options, additionalInfo: any = {}) {

    const { parent, original, loaders } = additionalInfo

    const isSymbol = typeof name === 'symbol'

    // Specify the current path of the object
    const parentId = parent?.[specialKeys.isGraphScript].path
    const path = (parentId) ? [parentId, name] : ((typeof name === 'string') ? [name] : [])
    const absolutePath = path.join(options.keySeparator ?? keySeparator)

        
    const __ = {

        // ---------- Identifiers ----------
        name,
        symbol: Symbol('isGraphScript'), // A unique value to compare against

        // ---------- Relative Position ----------
        root: isSymbol ? name : parent[specialKeys.isGraphScript].root, // Set graph property
        path: absolutePath, // Temporary Path Property

        // ---------- Instantiation Options ----------
        options,

        // ----------Original Instantiation Configuration Object ----------
        original,

        // ---------- Loader State Tracker ----------
        // TODO: Make sure the loaders are using this so it can be tracked!
        states: {},

        // ---------- Nested Components Map ----------
        components: new Map(),
        connected: false,
        resolved: false,

        // ---------- Listener Managers ----------
        flow: new FlowManager(),

        // ---------- Creation Managers ----------
        create: (esc) => {
            if (!options.loaders) options.loaders = loaders // re-apply loaders to the options
            return create(esc, undefined, options)
        },

        // ---------- Lifecycle Managers ----------
        stop: {
            name: 'stop',
            value: false,
            add: addCallback,
            callbacks: {
                before: [],
                main: [],
                after: [],
            },
        },

        start: {
            name: 'start',
            value: false,
            add: addCallback,
            callbacks: {
                before: [],
                main: [],
                after: [],
            },
        },

    } as ESComponent['__']

    const toRunProxy = function () { return runRecursive.call(this, __.ref) }
    __.start.run = toRunProxy.bind(__.start)
    __.stop.run = toRunProxy.bind(__.stop)

    return __
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