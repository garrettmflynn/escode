import { isNativeClass, merge, resolve } from '../common/utils/index'
import { specialKeys } from "../../../spec/properties"
import parse from "./parse"
import { ApplyOptions, Loaders } from "./types"
import { toReturn } from "./symbols"
import ESComponent from "../../esc.spec"

import { sortLoaders, runLoaders } from './utils/loaders'

// Native Loaders
import * as propsLoader from "./escode-props-loader"
import * as parentLoader from "./escode-parent-loader"
import Root from './Root'
import { is } from './components'

export default function load(esc, loaders: Loaders = [], options: ApplyOptions): ESComponent {
    
    const tic = performance.now()


    const parent = options.parent // Make sure not to proxy the window if undefined...
    const {
        parentObject,
        overrides = {},
        opts = {},
        name,
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
    const info = { name, parent, original, loaders }
    const root = new Root(esc, info, opts) // Create root property on the objct

    esc = merge(esc, overrides) // Merge with overrides

    // Run the initialiation components
    const sortedLoaders = sortLoaders(loaders)
    const loaded = runLoaders(sortedLoaders, { main: esc, overrides: overrides, options: opts }, 'init') // Complete component resolution

    const component = resolve(loaded, loaded => {
        

        // Load the parent property
        if (!loaded[specialKeys.parent] && parent)  loaded[specialKeys.parent] = parent // This is currently required...
        const parented = runLoaders([parentLoader], { main: loaded, options: opts }) // Use original parent here (in case none are specified later)

        // Load the props property
        const propped = runLoaders([propsLoader], { main: parented, options: opts}) // Use original parent here (in case none are specified later)

        // Load all other properties
        const res = runLoaders(sortedLoaders, { main: propped, options: opts }, 'load') // Recognize all special keys

        // -------- Bind All Functions to Node --------
        for (let key in loaded) {
            const og = loaded[key]
            if (typeof og === 'function') {
                const context = loaded[specialKeys.proxy] ?? loaded
                loaded[key] = og.bind(context)
            }
        }

        // Return the resolved component
        return resolve(res, (esc) => {
            if (parentObject) parentObject[name] = esc // set resolved component immediately on the parent
            root.loaded.run(esc) // onload callbacks (including from root)
            return esc
        })
    })

    // Return the resolved component
    return component
}