import { ArrayPath, ListenerInfo, ListenerLookups, ListenerPool, ListenerRegistry, MonitorOptions, ReferenceShortcut } from "./types"
import * as utils from './utils'
import * as infoUtils from './info'
import { isProxy } from './globals'
import { getFromPath } from "../../common/pathHelpers"
import { setFromOptions } from "./optionsHelpers"

export const info = (id, callback, path, originalValue, base, listeners, options: MonitorOptions, refShortcut: Partial<ReferenceShortcut> = {}) => {
    if (typeof path === 'string') path = path.split(options.keySeparator)
    const relativePath = path.join(options.keySeparator)

    const refs = base

    const shortcutRef = refShortcut.ref
    const shortcutPath = refShortcut.path

    const get = (path: ArrayPath) => {
        const thisBase = shortcutRef ?? base
 
        const res = getFromPath(thisBase, path, {
            keySeparator: options.keySeparator,
            fallbacks: options.fallbacks,
        })

        return res
    }

    const set = (path: ArrayPath, value) => {
        const thisBase = shortcutRef ?? base

        setFromOptions(path, value, options, {
            reference: thisBase,
            listeners
        })
    }

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
        get current() { return get(shortcutPath ?? info.path.absolute) },
        set current(val) { set(shortcutPath ?? info.path.absolute, val) },
        get parent() { 
            return get(shortcutPath ? shortcutPath?.slice(0,-1) : info.path.parent) 
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
    return true
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
    if (listeners[type]) listeners[type](fullInfo, allListeners, allListeners.lookup) // goes up to register()
    else {
        const path = utils.getPath('absolute', fullInfo)
        allListeners[type][path][fullInfo.sub] = fullInfo
        if (allListeners.lookup) registerInLookup(path, fullInfo.sub, allListeners.lookup)
    }
}

const get = (info, collection) => collection[utils.getPath('absolute', info)]


const handler = (info, collection, subscribeCallback, lookups?: ListenerLookups) => {
    
    // Create Listener for this Object
    let success = !!get(info, collection)
    if (!success) {
        let parent = info.parent
        let val = parent?.[info.last] // Parent may not exist yet...but we still want to register a potential listener
        success = subscribeCallback(val, parent)
    }

    // Register in Collection
    // if (success) 
    return register(info, collection, lookups)
    // else console.warn('Listener revoked for non-existent parent:', info.path.absolute ) 
}


export const setterExecution = (listeners, value) => {
    return utils.iterateSymbols(listeners, (_, o: ListenerInfo) => {
        const path = utils.getPath('output', o)
        utils.runCallback(o.callback, path,  {}, value)
    })
}

export function setters (info: ListenerInfo, collection: ListenerPool, lookups?: ListenerLookups) {

    const thisValue = this 
    return handler(info, collection['setters'], (value, parent) => {

        let val = value
        if (!parent) return

        if (!parent[isProxy]) { 

            let redefine = true
            try {
                delete parent[info.last] // removing original definition
            }  catch (e) {
                console.error('Unable to redeclare setters. May already be a dynamic object...')
                redefine  = false
            }

            if (redefine) {
                const isGraphScriptProperty = info.last.slice(0,2) === '__'
                try {
                    Object.defineProperty(parent, info.last, {
                        get: () => val,
                        set: async (v) => {
                            const isFunction = typeof val === 'function'
                            val = v
                            if (!isFunction) {
                                const listeners = Object.assign({}, collection['setters'][utils.getPath('absolute', info)])
                                setterExecution(listeners, v)
                            }
                            else val = getProxyFunction.call(thisValue, info, collection, val)
                        },
                        enumerable: isGraphScriptProperty,
                        configurable: true // TODO: Ensure that you are removing later...
                    })
                } catch (e) {
                    throw e
                }
            }
        }
    }, lookups)
}


export function getProxyFunction(info, collection, fn) {
    return function (...args) {
        const listeners = collection['functions'][utils.getPath('absolute', info)]
        const res = functionExecution(this, listeners, fn ?? info.original, args)
        return res.output // Return Standard Output
    }
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

    // Register for functions
    return handler(info, collection['functions'], (_, parent) => {      
        if (!parent[isProxy]) { 
            parent[info.last] = getProxyFunction.call(this, info, collection)

            // Also register as a setter
            return setters(info, collection, lookups)
        }
    }, lookups)
}