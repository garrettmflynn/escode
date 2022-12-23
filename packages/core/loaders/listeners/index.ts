import { specialKeys } from "../../../../spec/standards"
import Monitor from "../../../esmonitor/src"
import FlowManager from "../../edgelord/index"

export const name = 'listeners'

export const required = false // Only applied if listeners

export const properties = {
    dependents: [specialKeys.listeners.value]
}

// const manager = new FlowManager()

const listenerLoader = ( esc, options ) => {

    if (!options.monitor) options.monitor = new Monitor(options) // Shared monitor for the graph

    const configuration = esc[specialKeys.isGraphScript]
    const manager = new FlowManager() // Currently instance specific
    const listeners = esc[specialKeys.listeners.value]

    manager.setInitialProperties(listeners, configuration.path, {
        id: configuration.root, // NOTE: Make sure this can change with the root
        monitor: options.monitor,
        options: options
    })


    Object.defineProperty(esc, specialKeys.listeners.value, {
        value: manager,
        enumerable: false,
        configurable: false,
        writable: false
    })    

    return esc
}


export default listenerLoader