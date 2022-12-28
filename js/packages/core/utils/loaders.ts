import { defaultProperties } from "../../../../spec/properties"
import { all } from "../../common/properties"
import { resolve } from "../../common/utils"
import { Loaders, SortedLoaders } from "../types"


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
export const runLoaders = (loaders: Loaders | SortedLoaders, inputs: {
    main: any,
    overrides?: any,
    options?: any
}, which?) => {

    const { main, options } = inputs


    let preloaded: Loaders | undefined;
    if (!Array.isArray(loaders)) {
        if (!loaders[which]) return main
        const sorted = loaders as SortedLoaders
        loaders = sorted[which] ?? []
        switch (which) {
            case 'load':
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

    if (loadersToUse) return compose(loadersToUse, main, [options], (output) => !output || typeof output !== 'object')
    else return main
}

export const sortLoaders = (loaders: Loaders) => {
    const sorted: Partial<SortedLoaders> = {}
    loaders.forEach(o => {
        const behavior = (typeof o === 'function') ? 'load' : o.behavior ?? 'load'
        const theseLoaders = sorted[behavior] = sorted[behavior] ?? []
        theseLoaders.push(o)
    })

    return sorted as SortedLoaders

}

// TODO: Add a way to move this after the composition loader.
// This will require defining specific keys on the loaders object to determine the order of execution

export const filterLoaders = (esc, loaders: Loaders, beenLoaded: Loaders = []) => {

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
            }

            if (include && dependents) created.push(...dependents)

            return include
        }
    })

    return usedLoaders
}



  // Combine loaders
  export const combineLoaders = (original: Loaders = [], additional: Loaders) => {

    // If there are no original loaders, return the additional
    if (!original || original.length === 0) return additional

    // If there are no additional loaders, return the original
    if (!additional || additional.length === 0) return original

    // Filter out duplicate names
    const seen: string[] = []
    const all =  [...original, ...additional]
    return all.filter((o) => {
        if (typeof o === 'function') return true
        else {
            const name = o.name
            if (!name) return true
            else {
                const include = !seen.includes(name)
                if (!include) return false
                seen.push(name)
                return true
            }
        }
    }, undefined) 
}