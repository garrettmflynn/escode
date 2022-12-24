import { specialKeys } from "../../../../spec/properties"
import Monitor from "../../esmonitor/src"
import FlowManager from "./edgelord/index"

export const name = 'listeners'

export const required = true // Only applied if listeners

export const properties = {
    dependents: [specialKeys.listeners.value]
}

const manager = new FlowManager()

// LOADER WITH OPTIONS: The only option use here is the options.listen callback to get updates...
const listenerLoader = ( esc, options ) => {

    const root = esc[specialKeys.root]
    const listeners = esc[specialKeys.listeners.value]

    Object.defineProperty(esc, specialKeys.listeners.value, {
        value: manager,
        enumerable: false,
        configurable: false,
        writable: false
    })    


    let absPath

    root.start.add((resolved) => { 
        absPath = [root.root, ...root.path.split('.')].filter(str => str !== '')
        manager.setReference(root.symbol, resolved) // Setting listeners with each reference
        manager[(root.symbol === root.root) ? 'start' : 'register'](listeners, absPath)
    })

    root.stop.add(() => { 
        root.listeners.clear()
    })


    root.listeners = {
        clear: (from) => manager.clear(from, absPath),
        remove: (from, to) =>  manager.remove(from, to, absPath)
    }

    return esc
}


export default listenerLoader