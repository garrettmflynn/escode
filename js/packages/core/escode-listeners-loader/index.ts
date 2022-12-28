import { specialKeys } from "../../../../spec/properties"
import Monitor from "../../esmonitor/src"
import FlowManager from "./edgelord/index"

export const name = 'listeners'

export const required = true // Only applied if listeners

export const properties = {
    dependents: [specialKeys.listeners.value]
}

const manager = new FlowManager()

const getAbsolutePath = (root) =>  [root.root, ...root.path.split('.')].filter(str => str !== '')
// LOADER WITH OPTIONS: The only option use here is the options.listen callback to get updates...
const listenerLoader = ( esc, options ) => {

    const root = esc[specialKeys.root]

    let absPath

    manager.setReference(root.symbol, esc) // Setting listeners with each reference

    root.start.add((resolved) => { 
        const listeners = esc[specialKeys.listeners.value]

        if (listeners){
            absPath = getAbsolutePath(root)
            manager[(root.symbol === root.root) ? 'start' : 'register'](listeners, absPath)
        }
    })

    root.stop.add(() => { 
        root.listeners.clear()
    })


    root.listeners = {
        manager: manager,
        get: (from) => {
            from = (from) ? `${from}.${root.path}` : root.path
            const got = manager.get(from, root.root)
            return got
        },
        add: (from, to, value) => manager.add(from, to, value, getAbsolutePath(root)),
        clear: (from) => manager.clear(from, getAbsolutePath(root)),
        remove: (from, to) =>  manager.remove(from, to, getAbsolutePath(root))
    }

    return esc
}


export default listenerLoader