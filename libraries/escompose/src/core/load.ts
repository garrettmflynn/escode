import create, { resolve } from "."
import { all } from "../../../common/properties"
import { defaultProperties, keySeparator, specialKeys } from "../../../esc/standards"
import parse from "./parse"
import { ApplyOptions, Loaders } from "../types"
import pathLoader from "../loaders/path"
import { toReturn } from "./symbols"


// Use a function composition technique run the loaders in order
const runLoaders = (loaders: Loaders, esc, toApply, opts) => {
    return loaders.reduce(
        (x, f) => resolve(x, (res) => {
            let func = (typeof f === 'function') ? f : f.default
            const output = func(res, toApply, opts)
            return (output !== undefined) ? output : res // Return valid response
        }),
        esc
    )
}

// TODO: Add a way to move this after the composition loader.
// This will require defining specific keys on the loaders object to determine the order of execution

const filterLoaders = (esc, loaders: Loaders) => {

    const keys = all(esc).filter(str => str.slice(0, 2) === '__') // Grab used keys

    const defaultPropertiesCopy = Object.values(defaultProperties)
    const created = [...defaultPropertiesCopy] // Assume these are created

    const usedLoaders = loaders.filter(o => {
        if (o && typeof o === 'object') {
            const name = o.name
            const { dependencies, dependents } = o.properties
            let include = !dependencies
            if (dependencies) {
                const optionalNameMessage = name ? ` (${name})` : ''
                const found = dependencies.find(key => keys.includes(key))
                if (found) {
                    const deps = {}
                    dependencies.forEach((key) => deps[key] = created.includes(key))
                    const missingDependency = dependencies.filter((key) => !created.includes(key))
                    if (missingDependency.length) console.warn(`The loader${optionalNameMessage} for ${dependencies.join(', ')} might be loaded too early, since we are missing the following dependencies: ${missingDependency.join(', ')}`)
                    include = true
                }
                else console.warn(`Ignoring the loader${optionalNameMessage} for: ${dependencies.join(', ')}`)
            }
            
            if (include && dependents) created.push(...dependents)

            return include
        }
    })

    return usedLoaders
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
    const __ = {
        symbol: Symbol('isGraphScript'), // A unique value to compare against
        graph: isSymbol ? name : parent[specialKeys.isGraphScript].graph, // Set graph property
        options: opts,
        original: original,
        states: {
            connected: false,
            initial: {
                start: esc[specialKeys.start],
                stop: esc[specialKeys.stop],
            }
        },
        create: (esc) => create(esc, undefined, opts, loaders), // Define a consistent create function
    }

    esc[specialKeys.isGraphScript] = __ // Set __ property

    // Specify the current path of the object
    const parentId = parent?.[specialKeys.isGraphScript].path
    const path = (parentId) ? [parentId, name] : ((typeof name === 'string') ? [name] : [])
    const absolutePath = path.join(opts.keySeparator ?? keySeparator)

    // Set temporary path property
    esc[specialKeys.isGraphScript].path = absolutePath

    // Set inflexible parent property
    const hasParent = esc[specialKeys.parent]
    if (!hasParent && parent) esc[specialKeys.parent] = parent


    const filtered = filterLoaders(esc, loaders)
    const res = runLoaders(filtered, esc, toApply, opts)

    return resolve(res, (esc) => {

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
        pathLoader(esc, undefined, opts)
        // esc[specialKeys.resize] = states.onresize
        // esc[specialKeys.parent] = states.parentNode


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

                const resolution = load(ref, loaders, copy) // Apply loaders to nested components

                // Allow users to await the resolution of all children
                Object.defineProperty(info.parent[name], specialKeys.promise, { value: resolution, writable: false, })

                return resolve(resolution)
            })

            // When All Children are Initialized
            const res = resolve(promises, (resolved) => {
                isReady()
                return resolved
            })

            if (waitForChildren) return resolve(res, () => esc)
        }
        else isReady()

        // Ensure all GraphScript properties are non-enumerable
        const keys = all(esc)
        for (let key of keys) {
            const isGraphScriptProperty = key.includes(specialKeys.isGraphScript)
            if (isGraphScriptProperty) {
                const desc = Object.getOwnPropertyDescriptor(esc, key)
                if (desc?.enumerable) Object.defineProperty(esc, key, { ...desc, enumerable: false})
            }
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