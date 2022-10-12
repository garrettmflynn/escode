import { ListenerInfo, ListenerPool } from "./types"
import * as utils from './utils'

const register = (info, collection) => {
    // Place in Function Registry
    if (!collection[info.path.absolute]) collection[info.path.absolute] = {}
    collection[info.path.absolute][info.sub] = info
}

const get = (info, collection) => collection[info.path.absolute]

const handler = (info, collection, subscribeCallback) => {
    // Create Listener for this Object
    
    if (!get(info, collection)) {
        let parent = info.parent
        let val = parent[info.last]
        subscribeCallback(val, parent)
    }

    // Register in Collection
    register(info, collection)
}

export const getters = (info: ListenerInfo, collection: ListenerPool) => {
    handler(info, collection, (value, parent) => {
        let val = value
        Object.defineProperty(parent, info.last, {
            get: () => val,
            set: async (v) => {
                const listeners = Object.assign({}, collection[info.path.absolute])
                await utils.iterateSymbols(listeners, (_, o: ListenerInfo) => o.callback(o.path.output, v))
                val = v
            },
            enumerable: true
        })
    })
}




export const functions = (info: ListenerInfo, collection: ListenerPool) => {
    handler(info, collection, (_, parent) => {        
        parent[info.last] = async function(...args) {
            const listeners = Object.assign({}, collection[info.path.absolute])
            const output = await info.original.call(this, ...args)
            await utils.iterateSymbols(listeners, (_, o: ListenerInfo) => o.callback(o.path.output, output))
            return output
        }
    })
    
}