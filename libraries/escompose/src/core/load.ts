import create from "./index"
import { resolve } from '../utils/index'
import { all } from "../../../common/properties"
import { defaultProperties, keySeparator, specialKeys } from "../../../esc/standards"
import parse from "./parse"
import { ApplyOptions, Loader, Loaders, SortedLoaders } from "../types"
import { toReturn } from "./symbols"
import { ESComponent } from "../../../esc"
import FlowManager from "../../../drafts/edgelord/index"

import * as components from "./components"
import { isNativeClass } from "../../../external/graphscript"

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
        waitForChildren,
        toApply = {},
        callbacks = {},
        opts = {},
        name = Symbol('root'), // Create symbol to identify the root instance
    } = options as ApplyOptions

    // Track the original component structure
    const original = esc


    esc = parse(esc, toApply, opts) // Parse the configuration object into a final configuration object (required)


    if (esc[toReturn]) return esc[toReturn] // Shortcut to return the existing (updated) component

    // Return bulk operation requests
    if (Array.isArray(esc)) return resolve(esc.map(o => load(o, loaders, options)))

    // Set __ property
    const isSymbol = typeof name === 'symbol'
    const equivalentCreateFunction = (esc) => {
        if (!opts.loaders) opts.loaders = loaders // re-apply loaders to the options
        return create(esc, undefined, opts)
    } // Pass something to create Components in the same way to the loaders


    let resolved; // Will resolve to the final object

    const __ = {
        name,
        symbol: Symbol('isGraphScript'), // A unique value to compare against
        graph: isSymbol ? name : parent[specialKeys.isGraphScript].graph, // Set graph property
        options: opts,
        original,
        states: {
            connected: false,
        },
        components: new Map(),
        flow: new FlowManager(),
        create: equivalentCreateFunction,

        // Temporary Path Property
        path: '',

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

        // Trigger start sequence
        start: {
            name: 'start',
            value: false,
            add: addCallback,
            callbacks: {
                before: [],
                main: [],
                after: [],
            },
        }
    } as ESComponent['__']

    const toRunProxy = function () { return runRecursive.call(this, resolved) }
    __.start.run = toRunProxy.bind(__.start)
    __.stop.run = toRunProxy.bind(__.stop)

    esc[specialKeys.isGraphScript] = __ // Set __ property

    const sortedLoaders = sortLoaders(loaders)
    const loadedMystery = runLoaders(sortedLoaders, { main: esc, overrides: toApply, options: opts }, 'load') // Complete component resolution

    const component = resolve(loadedMystery, loaded => {
        // Parent Loader
        let toApplyParent = (!loaded[specialKeys.parent] && parent) ? { [specialKeys.parent]: parent } : {}
        const parented = runLoaders([parentLoader], { main: loaded, overrides: toApplyParent, options: opts }) // Use original parent here (in case none are specified later)

        // Props Loader
        const propped = runLoaders([propsLoader], { main: parented }) // Use original parent here (in case none are specified later)

        const res = runLoaders(sortedLoaders, { main: propped, overrides: toApply, options: opts }, 'activate') // Recognize all special keys

        return resolve(res, (esc) => {

            resolved = esc

            // -------- Set Resolved Component --------
            if (parentObject) parentObject[name] = esc // setting immediately

            // On Creation Callbacks
            if (isSymbol && callbacks.onRootCreated) callbacks.onRootCreated(name, esc)
            if (callbacks.onInstanceCreated) callbacks.onInstanceCreated(esc.__.path, esc)

            // On Ready Callback
            const isReady = () => {

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
                configuration.stop.initial = resolved[specialKeys.stop]
                resolved[specialKeys.stop] = configuration.stop.run


                // Ensure all GraphScript properties are non-enumerable
                // And bind all functions to the node
                const keys = all(esc)

                for (let key of keys) {
                    const isGraphScriptProperty = key.includes(specialKeys.isGraphScript) || key === 'default'
                    if (isGraphScriptProperty) {
                        const desc = Object.getOwnPropertyDescriptor(esc, key)
                        if (desc?.enumerable) Object.defineProperty(esc, key, { ...desc, enumerable: false })
                    }

                    // if (typeof esc[key] === 'function') esc[key] = esc[key].bind(esc) // ensure all functions are bound to the node
                }

                // Trigger Parent / Path Loader
                const finalParent = esc[specialKeys.parent]
                esc[specialKeys.parent] = finalParent


                if (callbacks.onInstanceReady) callbacks.onInstanceReady(esc.__.path, esc)
            }


            const configuration = esc[specialKeys.isGraphScript]

            // Apply Loaders to Nested Components
            const nested = components.from(esc)
            if (nested) {

                // Resolve all nested components
                const promises = nested.map((info) => {
                    const copy = Object.assign({}, options)
                    const name = copy.name = info.name
                    delete copy.toApply // Only apply to the root node
                    copy.parentObject = info.parent
                    copy.parent = esc

                    const ref = info.ref

                    // TODO: Reinstate the ability to define child position on the node (in case it is confused...)
                    if (ref) {
                        const resolution = load(ref, loaders, copy) // Apply loaders to nested components

                        // Allow users to await the resolution of all children
                        Object.defineProperty(info.parent[name], specialKeys.promise, { value: resolution, writable: false, })

                        return resolve(resolution, (res) => {
                            configuration.components.set(name, res)
                            return res
                        })
                    } else {
                        delete info.parent[name]
                        console.error('No reference found for nested component', info)
                    }
                })

                // When All Children are Initialized
                const res = resolve(promises, (resolved) => {
                    isReady()
                    return resolved
                })

                // NOTE: This does not happen anymore...
                if (waitForChildren) return resolve(res, () => esc)

            } else isReady()

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