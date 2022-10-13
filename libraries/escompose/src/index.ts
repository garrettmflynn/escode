import { getFromPath } from "../../common/pathHelpers"
import Monitor from "../../esmonitor/src"
import createComponent from "./create"
import * as clone from "../../common/clone.js"

const create = (config, options) => {

    // config = clone.deep(config) // Start with a deep copy
    console.log(config)

    if (!options.keySeparator) options.keySeparator = '.'

    // Get Monitor
    let monitor = options.monitor
    if (!(monitor instanceof Monitor)) monitor = options.monitor = new Monitor(options)

    let components = {}

    // ------------------ Create Components ------------------
    // TODO: Ensure that this doesn't have a circular reference
    const drill = (o, id: string | symbol, parent?, path: any[] = []) => {

        // ------------------ Merge ESM with External Properties ------------------

        const clonedEsCompose = clone.deep(o.esCompose) ?? {}
        console.log('ESC', path, clonedEsCompose)
        let merged = Object.assign({}, Object.assign(Object.assign({}, clonedEsCompose), o))
        delete merged.esCompose
        console.log('merged', path, clone.deep(merged))
        console.log('merged (active)', path, merged)
        merged = clone.deep(merged)
        console.log('merged (active2)', path, merged)

        // // Shallow
        // const esCompose = o.esCompose ?? {}
        // const copy = Object.assign({}, o)
        // const merged = Object.assign({}, esCompose)
        
        // const esCompose = o.esCompose ?? {}
        // const merged = Object.assign(o, esCompose)

        // // Deep Copy
        // const merged = Object.assign(o.esCompose ?? {}, o)

        // ------------------ Create Instance with Special Keys ------------------
        const instance = createComponent(id, merged, parent)

        // ------------------ Convert Nested Components ------------------
        if (instance.esComponents) {
            for (let name in instance.esComponents) {
                const base = instance.esComponents[name]
                const thisInstance = drill(base, name, instance, path) // converting from top to bottom
                instance.esComponents[name] = thisInstance // replace in config
                // monitor.on(name, logUpdate) // TODO: Fix infinite loop
            }
        }

        components[path.join(options.keySeparator)] = instance

        return instance
    }

    const id = Symbol('root')
    const instance = drill(config, id)
    
    console.log('instance', instance, clone.deep(instance))

    let fullInstance = clone.deep(instance)

    monitor.set(id, fullInstance) // Setting root instance
    fullInstance.esInit()

    const onOutput = (name, _, ...args) => {

        console.log('out', name, args, fullInstance.esListeners)
        const defaultPath = '.default'
        const noDefault = name.slice(0, -defaultPath.length)
        const listenerGroups = [fullInstance.esListeners[name], fullInstance.esListeners[noDefault]]

        listenerGroups.forEach(group => {
            for (let key in group) {

                let target = group[key]
                const type = typeof target
                const noDefault = type !== 'function' && !target?.default

                // ------------------ Grab Correct Target to Listen To ------------------
                // Get From Passed String
                if (type === 'string') target = group[key] = fullInstance.esComponents[target]
                
                // Get From Listener Key 
                else if (noDefault) {
                    // const options = listening
                    const path = key.split('.')
                    target = getFromPath( fullInstance.esComponents, path, {
                        fallbacks: ['esComponents'],
                        keySeparator: options.keySeparator,
                    })
                }

                // ------------------ Handle Target ------------------
                // Direct Object with Default Function
                if (target?.default) target.default(...args)

                // Direct Function
                else if (typeof target === 'function') target(...args)

                else {
                    console.warn(`Deleting listener: ${name} —> ${key}`)
                    delete group[key]
                }
            }
        })
    }

    // Assign Listeners
    for (let path in fullInstance.esListeners) {
        const basePath = [id, ...path.split('.')]
        const obj = monitor.get(basePath, undefined)
        if (obj.__isESComponent) basePath.push('default') // Listen to the default if components are targeted
        monitor.on(basePath, onOutput)
    }

    return fullInstance
}

export default create