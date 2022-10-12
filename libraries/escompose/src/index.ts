import Monitor from "../../esmonitor/src"
import createComponent from "./create"

const create = (config, options) => {

    // Get Monitor
    let monitor = options.monitor
    if (!(monitor instanceof Monitor)) monitor = options.monitor = new Monitor(options)

    const drill = (o, parent?) => {
        if (o.components) {
            for (let name in config.components) {

                const base = config.components[name]
                drill(base, o)

                // Instance the Component
                const copy = Object.assign({}, base)
                const esSrc = copy.esSrc
                delete copy.esSrc
                const merged = Object.assign(Object.assign({}, esSrc), copy)
                const instance = createComponent(name, merged, parent)
                monitor.set(name, instance)
                config.components[name] = instance // replace in config
                    
        
                // monitor.on(name, logUpdate) // TODO: Fix infinite loop
            }
        }
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