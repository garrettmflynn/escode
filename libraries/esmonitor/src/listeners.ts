import { ActiveInfo, ListenerInfo, ListenerPool } from "./types"
import * as utils from './utils'
import * as infoFunctions from './info'



const register = (info, collection) => {
    // Place in Function Registry
    const absolute = utils.getPath('absolute', info)
    if (!collection[absolute]) collection[absolute] = {}
    collection[absolute][info.sub] = info
}

const get = (info, collection) => collection[utils.getPath('absolute', info)]

export const getExecutionInfo = async (func, args, info) => {

    let result = {
        value: { },
        output: undefined,
    } as {
        value: ActiveInfo,
        output: any
    }
    
    

    for (let key in info)  {
        if (info[key] && infoFunctions[key]) {
            const ogFunc = func
            func = async (...args) => {
                const o = await infoFunctions[key](ogFunc, args)
                result.value[key] = o.value
                return o.output
            }   
        }
    }

    result.output = await func(...args)
    return result
}

const handler = (info, collection, subscribeCallback, monitor = true) => {
    
    // Create Listener for this Object
    if (monitor) {
        if (!get(info, collection)) {
            let parent = info.parent
            let val = parent[info.last]
            subscribeCallback(val, parent)
        }
    }

    // Register in Collection
    register(info, collection)
}


export const setterExecution = async (listeners, value) => {
    const executionInfo = {}
    await utils.iterateSymbols(listeners, (_, o: ListenerInfo) => o.callback(utils.getPath('output', o), executionInfo, value))
}

export const setters = (info: ListenerInfo, collection: ListenerPool, monitor = true) => {
    handler(info, collection, (value, parent) => {
        let val = value

        delete parent[info.last] // removing original definition

        try {

            Object.defineProperty(parent, info.last, {
                get: () => val,
                set: async (v) => {
                    const listeners = Object.assign({}, collection[utils.getPath('absolute', info)])
                    setterExecution(listeners, v)
                    val = v
                },
                enumerable: true
            })
        } catch (e) {
            throw e
        }
    }, monitor)
}


export const functionExecution = async (context, listeners, func, args) => {
    listeners = Object.assign({}, listeners)
    const keys = Object.getOwnPropertySymbols(listeners)
    const info = listeners[keys[0]] as ListenerInfo // Info is same, callback is different
    const executionInfo = await getExecutionInfo(async (...args) => await func.call(context, ...args), args, info.infoToOutput)
    await utils.iterateSymbols(listeners, (_, o: ListenerInfo) => {
        o.callback(utils.getPath('output', o), executionInfo.value, executionInfo.output)
    })

    return executionInfo
}


export const functions = (info: ListenerInfo, collection: ListenerPool, monitor = true) => {
    handler(info, collection, (_, parent) => {        
        parent[info.last] = async function(...args) {
            const listeners = collection[utils.getPath('absolute', info)]
            functionExecution(this, listeners, info.original, args)
        }
    }, monitor)
}