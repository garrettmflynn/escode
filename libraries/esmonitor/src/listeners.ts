import { ListenerInfo, ListenerLookups, ListenerPool, ListenerRegistry, MonitorOptions } from "./types"
import * as utils from './utils'
import * as infoUtils from './info'
import { isProxy } from './globals'
import { getFromPath } from "../../common/pathHelpers"
import { setFromOptions } from "./optionsHelpers"

export const info = (id, callback, path, originalValue, base, listeners, options: MonitorOptions) => {
    if (typeof path === 'string') path = path.split(options.keySeparator)
    const relativePath = path.join(options.keySeparator)

    const refs = base
    const get = (path) => {
        return getFromPath(base, path, {
            keySeparator: options.keySeparator,
            fallbacks: options.fallbacks,
        })
    }

    const set = (path, value) => setFromOptions(path, value, options, {
        reference: base,
        listeners
    })

    // Derive onUpdate Function
    let onUpdate = options.onUpdate
    let infoToOutput = {}

    if (onUpdate && typeof onUpdate === 'object' && onUpdate.callback instanceof Function) {
        infoToOutput = onUpdate.info ?? {}
        onUpdate = onUpdate.callback
    }

    const absolute = [id, ...path]
    let pathInfo = {
        absolute,
        relative: relativePath.split(options.keySeparator),
        parent: absolute.slice(0,-1)
    } as Partial<ListenerInfo['path']>

    pathInfo.output =  pathInfo[options.pathFormat]
    const completePathInfo = pathInfo as ListenerInfo['path']

    const info = {
        id, 
        path: completePathInfo, 
        keySeparator: options.keySeparator,

        infoToOutput,
        callback: (...args) => {
            const output = callback(...args)
            
            // ------------------ Run onUpdate Callback ------------------
            if (onUpdate instanceof Function) onUpdate(...args)

            // Return Standard Output
            return output
        }, 
        get current() { return get(info.path.absolute) },
        set current(val) { set(info.path.absolute, val) },
        get parent() { 
            return get(info.path.parent) 
        },
        get reference(){ return refs[id] },
        set reference(val){ refs[id] = val },
        original: originalValue,
        history: (typeof originalValue === 'object') ? Object.assign({}, originalValue) : originalValue,
        sub: Symbol('subscription'),
        last: path.slice(-1)[0],
    } as ListenerInfo

    return info
}


const registerInLookup = (name, sub, lookups) => {

    if (lookups) {
        const id = Math.random()
        lookups.symbol[sub] = {
            name,
            id 
        } // set in lookup
        if (!lookups.name[name]) lookups.name[name] = {}
        lookups.name[name][id] = sub
    }
}

export const register = (info, collection, lookups?: ListenerLookups) => {
    // Place in Function Registry
    const absolute = utils.getPath('absolute', info)
    if (!collection[absolute]) collection[absolute] = {}
    collection[absolute][info.sub] = info

    // Place in Lookup Registry
    registerInLookup(absolute, info.sub, lookups)
}

const listeners = {
    functions, 
    setters
}

// Set Listener with Minimal Information
export const set = (type, absPath, value, callback, base, allListeners: Partial<ListenerRegistry>, options: MonitorOptions) => {

    const { id, path } = utils.getPathInfo(absPath, options)

    const fullInfo = info(id, callback, path, value, base, listeners, options)

    // ------------------ Set Listener in Registry ------------------
    if (listeners[type]) listeners[type](fullInfo, allListeners[type], allListeners.lookup) // goes up to register()
    else {
        const path = utils.getPath('absolute', fullInfo)
        allListeners[type][path][fullInfo.sub] = fullInfo
        if (allListeners.lookup) registerInLookup(path, fullInfo.sub, allListeners.lookup)
    }
}

const get = (info, collection) => collection[utils.getPath('absolute', info)]


const handler = (info, collection, subscribeCallback, lookups?: ListenerLookups) => {
    
    // Create Listener for this Object
    if (!get(info, collection)) {
        let parent = info.parent
        let val = parent[info.last]
        subscribeCallback(val, parent)
    }

    // Register in Collection
    register(info, collection, lookups)
}


export const setterExecution = (listeners, value) => {
    return utils.iterateSymbols(listeners, (_, o: ListenerInfo) => {
        const path = utils.getPath('output', o)
        utils.runCallback(o.callback, path,  {}, value)
    })
}

export function setters (info: ListenerInfo, collection: ListenerPool, lookups?: ListenerLookups) {
    handler(info, collection, (value, parent) => {
        let val = value

        if (!parent[isProxy]) { 

            let redefine = true
            try {
                delete parent[info.last] // removing original definition
            }  catch (e) {
                console.error('Unable to redeclare setters. May already be a dynamic object...')
                redefine  = false
            }

            if (redefine) {
                try {
                    Object.defineProperty(parent, info.last, {
                        get: () => val,
                        set: async (v) => {
                            val = v
                            const listeners = Object.assign({}, collection[utils.getPath('absolute', info)])
                            setterExecution(listeners, v)
                        },
                        enumerable: true,
                        configurable: true // TODO: Ensure that you are removing later...
                    })
                } catch (e) {
                    throw e
                }
            }
        }
    }, lookups)
}


export const functionExecution = (context, listeners, func, args) => {
    listeners = Object.assign({}, listeners)
    const keys = Object.getOwnPropertySymbols(listeners)
    const infoTemplate = listeners[keys[0]] ?? {} as ListenerInfo // Info is same, callback is different
    const executionInfo = infoUtils.get((...args) => func.call(context, ...args), args, infoTemplate.infoToOutput)

    utils.iterateSymbols(listeners, (_, o: ListenerInfo) => {
        const path = utils.getPath('output', o)
        utils.runCallback(o.callback, path, executionInfo.value, executionInfo.output)
    })

    return executionInfo
}


export function functions (info: ListenerInfo, collection: ListenerPool, lookups?: ListenerLookups) {
    handler(info, collection, (_, parent) => {      
        if (!parent[isProxy]) { 
            parent[info.last] = function (...args) {
                const listeners = collection[utils.getPath('absolute', info)]
                return functionExecution(this, listeners, info.original, args)
            }
        }
    }, lookups)
}