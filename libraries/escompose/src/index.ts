import Monitor from "../../esmonitor/src"
import createComponent from "./create"

const create = (config, options) => {

    // Get Monitor
    let monitor = options.monitor
    if (!(monitor instanceof Monitor)) monitor = options.monitor = new Monitor(options)

    const drill = (o) => {

        // const copy = Object.assign({}, o)
        const copy = o
        const esCompose = copy.esCompose ?? {}

        // const merged = Object.assign(Object.assign({}, esCompose), copy)
        const merged = esCompose
        for (let key in copy) merged[key] = copy[key]

        if (merged.components) {
            for (let name in merged.components) {

                const base = merged.components[name]

                // Convert from Bottom to Top
                const converted = drill(base)

                // Instance the Component
                const instance = createComponent(name, converted, merged)
                
                monitor.set(name, instance)
                merged.components[name] = instance // replace in config
                    
        
                // monitor.on(name, logUpdate) // TODO: Fix infinite loop
            }
        }

        return merged
    }

    drill(config)

    const onOutput = (name, info, ...args) => {

        for (let key in config.listeners[name]) {

            let target = config.listeners[name][key]
            const type = typeof target
            const noDefault = type !== 'function' && !target?.default

            // ------------------ Grab Correct Target to Listen To ------------------
            // Get From Passed String
            if (type === 'string') target = config.listeners[name][key] = config.components[target]
            
            // Get From Listener Key 
            else if (noDefault) {
                // const options = listening
                const path = key.split('.')
                target = config.components
                path.forEach(str => target = target[str])
            }

            // ------------------ Handle Target ------------------
            // Direct Object with Default Function
            if (target?.default) target.default(...args)

            // Direct Function
            else if (typeof target === 'function') target(...args)

            else console.log('Unsupported listener...', target)
        }
    }

    for (let path in config.listeners) {

        // Assign Top-Level Listeners
        monitor.on(path, onOutput)

        // Always Subscribe to Default
        const id = path.split('.')[0]
        monitor.on(`${id}.default`, onOutput)
    }

    return config
}

export default create