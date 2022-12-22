import create from "."
import { resolve } from '../utils/index'
import { all } from "../../../common/properties"
import { defaultProperties, keySeparator, specialKeys } from "../../../esc/standards"
import parse from "./parse"
import { ApplyOptions, Loaders, SortedLoaders } from "../types"
import pathLoader from "./loaders/path"
import { toReturn } from "./symbols"
import { ESComponent } from "../../../esc/esc"


// Use a function composition technique run the loaders in order
const runLoaders = (loaders: Loaders | SortedLoaders, inputs: {
    main: any,
    overrides: any,
    options: any,
    create: Function
}, which) => {

    const { main, overrides, options, create } = inputs
    

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

    if (loadersToUse){
        return loadersToUse.reduce(
            (x, f) => resolve(x, (res) => {
                let func = (typeof f === 'function') ? f : f.default
                const output = func(res, overrides, options)
                return (output && typeof output === 'object') ? output : res // Return valid response
            }),
            main
        )
    } else return main
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

const filterLoaders = (esc, loaders: Loaders, beenLoaded: Loaders =[]) => {

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

function addCallback(callback, priority?: boolean) {
    const { callbacks, priorityCallbacks } = this
    if (priority) priorityCallbacks.push(callback)
    else callbacks.push(callback)
    return true
}

async function runRecursive(resolved) {
    const { callbacks, priorityCallbacks, name } = this
    

    if (!this.value) {

        const isStop = name === 'stop'
        const configuration = resolved[specialKeys.isGraphScript]

        const callback = isStop ? configuration.stop.initial : resolved[specialKeys[name]]
        this.value = true


        if (!isStop) configuration.stop.value = false

        const toCall = (callback && !isStop) ? [...priorityCallbacks, callback, ...callbacks] : [...priorityCallbacks, ...callbacks]

        for (const callback of toCall) {
            await callback.call(resolved, resolved)
        }

        const hierarchy = Object.entries(resolved[specialKeys.hierarchy] ?? {}) as [string, ESComponent][]

        // Initialize Nested Components (and wait for them to be done)
        await resolve(hierarchy.map(async ([tag, component]) => {
            const promise = component[specialKeys.promise]
            if (promise && typeof promise.then === 'function' ) component = hierarchy[tag] = await promise // Wait for the component to be ready

            return await component[specialKeys.isGraphScript][name].run() // Run the component start / stop function
        }))

        // Call Final Function or Return
        if (isStop) {
            if (callback) callback.call(resolved, resolved) // Run general stop function last

            // Clear all listeners below esc node
            configuration.flow.clear()

            // Clear all listeners above the Component that reference it
            const path = resolved[specialKeys.isGraphScript].path
            let target = resolved
            while (target[specialKeys.parent][specialKeys.isGraphScript] !== undefined) {
                const res = target[specialKeys.element][specialKeys.parent] // parent is a component
                if (res) {
                    target = res
                    if (target){
                        const configuration = target[specialKeys.isGraphScript]
                        if (configuration) configuration.flow.clear(path)
                    }
                } else break
            }



            configuration.start.value = false // Can be restarted
        }

        return true
    }
}


export default function load(esc, loaders: Loaders = [], options: ApplyOptions) {
    
const parent = options.parent // Don't proxy the window...
    const {
        parentObject,
        waitForChildren,
        toApply = {},
        callbacks = {}, 
        opts = {},
        name = Symbol('root'), // Create symbol to identify the root instance
    } = options as ApplyOptions


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


    // Specify the current path of the object
    const parentId = parent?.[specialKeys.isGraphScript].path
    const path = (parentId) ? [parentId, name] : ((typeof name === 'string') ? [name] : [])
    const absolutePath = path.join(opts.keySeparator ?? keySeparator)


    let resolved; // Will resolve to the final object

    const __ = {
        symbol: Symbol('isGraphScript'), // A unique value to compare against
        graph: isSymbol ? name : parent[specialKeys.isGraphScript].graph, // Set graph property
        options: opts,
        original,
        states: {
            connected: false,
        },
        create: equivalentCreateFunction,

        // Temporary Path Property
        path: absolutePath,

        stop: {
            name: 'stop',
            value: false,
            add: addCallback,
            callbacks: [],
            priorityCallbacks: []
        },

        // Trigger start sequence
        start: {
            name: 'start',
            value: false,
            add: addCallback,
            callbacks: [],
            priorityCallbacks: []
        }
    } as ESComponent['__']

    const toRunProxy = function () {runRecursive.call(this, resolved)}
    __.start.run = toRunProxy.bind(__.start)
    __.stop.run = toRunProxy.bind(__.stop)

    esc[specialKeys.isGraphScript] = __ // Set __ property


    // Set inflexible parent property
    let hasParent = esc[specialKeys.parent]
    if (!hasParent && parent) hasParent = esc[specialKeys.parent] = parent

    const sortedLoaders = sortLoaders(loaders)
    const loaded = runLoaders(sortedLoaders, {main: esc, overrides: toApply, options: opts, create: equivalentCreateFunction}, 'load') // Complete component resolution
    const res = runLoaders(sortedLoaders, {main: loaded, overrides: toApply, options: opts, create: equivalentCreateFunction}, 'activate') // Recognize all special keys

    return resolve(res, (esc) => {


        resolved = esc

        // -------- Bind Functions to Node --------
        // TODO: Make sure you have to do this outside of the special properties...
        for (let key in esc) {
            if (typeof esc[key] === 'function') {
                // const desc = Object.getOwnPropertyDescriptor(esc, key)
                // if (desc && desc.get && !desc.set) esc = Object.assign({}, esc) // Support ESM Modules: Only make a copy if a problem
                const og = esc[key]
                esc[key] = (...args) =>  {
                    const context = esc[specialKeys.proxy] ?? esc
                    return og.call(context, ...args)
                }
            }
        }

        // -------- Set Path --------
        pathLoader(esc, {[specialKeys.parent]: hasParent}, opts) // Use original parent here (in case none are specified later)

        // -------- Set Resolved Component --------
        if (parentObject) parentObject[name] = esc // setting immediately

        // On Creation Callbacks
        if (isSymbol && callbacks.onRootCreated) callbacks.onRootCreated(name, esc)
        if (callbacks.onInstanceCreated) callbacks.onInstanceCreated(absolutePath, esc)

        // On Ready Callback
        const isReady = () => {
            if (callbacks.onInstanceReady) callbacks.onInstanceReady(absolutePath, esc)
        }

        // Apply Loaders to Nested Components
        const nested = getNested(esc)
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

                    return resolve(resolution)
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

            if (waitForChildren) return resolve(res, () => esc)
        }
        else isReady()

        // Add Stop Method
        const configuration = esc[specialKeys.isGraphScript]
        configuration.stop.initial = resolved[specialKeys.stop]
        resolved[specialKeys.stop] = configuration.stop.run
       

        // Ensure all GraphScript properties are non-enumerable
        // And bind all functions to the node
        const keys = all(esc)
        
        for (let key of keys) {
            const isGraphScriptProperty = key.includes(specialKeys.isGraphScript)
            if (isGraphScriptProperty) {
                const desc = Object.getOwnPropertyDescriptor(esc, key)
                if (desc?.enumerable) Object.defineProperty(esc, key, { ...desc, enumerable: false})
            }

            // if (typeof esc[key] === 'function') esc[key] = esc[key].bind(esc) // ensure all functions are bound to the node
        }




        // Return the esc object
        return esc
    })

}

function getNested (o) {
    const parent = o[specialKeys.hierarchy]
    if (!parent) return null
    let array = Object.entries(parent).map(([name,v]) => {
       return {
            ref: v,
            parent,
            name
        } as {
            name: string,
            ref: any,
            parent: any
        }
    })
    
    return array
}