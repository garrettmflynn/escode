import * as check from '../../common/check.js'
import Poller from './Poller.js'

import { Options } from '../../common/types'
import { PathFormat, ListenerInfo, InternalOptions, ListenerPool, ListenerLookup, ArrayPath, ListenerOptions } from './types'
import * as listeners from './listeners'
import { iterateSymbols, getPath } from './utils.js'
import { drillSimple } from '../../common/drill.js'
import { getFromPath, setFromPath } from '../../common/pathHelpers.js'
import { isProxy } from './inspectable/handlers.js'
import Inspectable from './inspectable/index.js'


export default class Monitor {

    poller = new Poller()

    options: Options = {
        pathFormat: 'relative',
        keySeparator: '.',
    }
    
    listenerLookup: ListenerLookup = {}
    listeners: {
        functions: ListenerPool,
        getters: ListenerPool,
        polling: Poller['listeners'],
    } = {
        polling: this.poller.listeners,
        functions: {},
        getters: {},
    }

    references: {
        [x:string | symbol]: {
            [x:string | symbol]: any
        }
    } = {}

    constructor(opts:Partial<Options>={}){
        Object.assign(this.options, opts)
        this.poller.setOptions(opts.polling)
    }

    get = (path) => getFromPath(this.references, path, {
        keySeparator: this.options.keySeparator,
        fallbacks: ['esComponents']
    })

    set = (path, value, ref:any = this.references, opts = {}) => setFromPath(path, value, ref, opts)

    // A simple wrapper for listen()
    on = (absPath: PathFormat, callback, options: ListenerOptions = {}) => {

        let splitPath = absPath
        if (typeof absPath === 'string') splitPath = absPath.split(this.options.keySeparator)
        else if (typeof absPath === 'symbol') splitPath = [absPath]

        const id = splitPath[0]

        return this.listen(id, callback, (splitPath as ArrayPath).slice(1), options)
    }


    createInfo = (id, callback, path, original) => {
        if (typeof path === 'string') path = path.split(this.options.keySeparator)
        const relativePath = path.join(this.options.keySeparator)

        const refs = this.references
        const get = this.get
        const set = this.set

        // Derive onUpdate Function
        let onUpdate = this.options.onUpdate
        let infoToOutput = {}

        if (onUpdate && typeof onUpdate === 'object' && onUpdate.callback instanceof Function) {
            infoToOutput = onUpdate.info ?? {}
            onUpdate = onUpdate.callback
        }

        const absolute = [id, ...path]
        let pathInfo = {
            absolute,
            relative: relativePath.split(this.options.keySeparator),
            parent: absolute.slice(0,-1)
        } as Partial<ListenerInfo['path']>

        pathInfo.output =  pathInfo[this.options.pathFormat]
        const completePathInfo = pathInfo as ListenerInfo['path']

        const info = {
            id, 
            path: completePathInfo, 
            keySeparator: this.options.keySeparator,

            infoToOutput,
            callback: async (...args) => {
                const output = await callback(...args)
                if (onUpdate instanceof Function) onUpdate(...args)
                return output
            }, 
            get current() { return get(info.path.absolute) },
            set current(val) { set(info.path.absolute, val) },
            get parent() { return get(info.path.parent) },
            get reference(){ return refs[id] },
            set reference(val){ refs[id] = val },
            original,
            history: (typeof original === 'object') ? Object.assign({}, original) : original,
            sub: Symbol('subscription'),
            last: path.slice(-1)[0],
        } as ListenerInfo

        this.listenerLookup[info.sub] = getPath('absolute', info)

        return info
    }

    listen = (id, callback, path: PathFormat = [], options: ListenerOptions, __internal: Partial<InternalOptions> = {}) => {


        let isDynamic = options.static ? !options.static : true

        if (typeof path === 'string') path = path.split(this.options.keySeparator)
        else if (typeof path === 'symbol') path = [path]

        const arrayPath = path as ArrayPath

        let baseRef = this.references[id]
        if (!baseRef) {
            console.error(`Reference ${id} does not exist.`)
            return
        }

        if (isDynamic && !globalThis.Proxy) {
            isDynamic = false
            console.warn('Falling back to using getters and setters...')
        }



        if (isDynamic && !baseRef[isProxy]) {
            const inspector = new Inspectable(baseRef, {
                callback: (path, info, update) => {
                    console.log('Handling internal calls', path, info, update)
                },
                keySeparator: this.options.keySeparator,
            })

            this.set(id, inspector) // reset reference
            baseRef = inspector
        }


        if (!__internal.poll) __internal.poll = check.esm(baseRef) // Inherit ESM status
        if (!__internal.seen) __internal.seen = []

        const __internalComplete = __internal as InternalOptions

        // Set Reference
        if (!this.references[id]) this.references[id] = baseRef // Setting base reference

        // Drill Reference based on Path
        let ref = this.get([id, ...arrayPath])

        // Create listeners for Objects
        const toMonitorInternally = (val, allowArrays=false) => {
            const first = val && typeof val === 'object'
            
            // Only Objects
            if (!first) return false

            // No Elements
            const isEl = val instanceof Element
            if(isEl) return false

            if (allowArrays) return true
            else return !Array.isArray(val)
        }

        // ------------------ Create Subscription ------------------

        // Option #1: Subscribe to each object property individually

        let subs = {}
        if (toMonitorInternally(ref, true)) {

            // TODO: Ensure that this doesn't have a circular reference
            const drillOptions = {
                condition: (_, val) => toMonitorInternally(val)
            }
            drillSimple(ref, (key, val, drillInfo) => {
                if (drillInfo.pass) return 
                else {

                    const fullPath = [...arrayPath, ...drillInfo.path]
                    if (typeof val === 'function') {
                        if (__internalComplete.poll) {
                            console.warn(`Skipping subscription to ${fullPath.join(this.options.keySeparator)} since its parent is ESM.`)
                        } else {
                            const info = this.createInfo(id, callback, fullPath, val)
                            this.add('functions', info)
                            const abs = getPath('absolute', info)
                            subs[abs] = info.sub
                        }
                    } else {
                        const internalSubs = this.listen(id, callback, fullPath, options, __internalComplete) // subscribe to all
                        Object.assign(subs, internalSubs)
                    }
                }
            }, drillOptions) 
            
        } 

        // Option #2: Subscribe to specific property
        else {

            const info = this.createInfo(id, callback, arrayPath, ref)

            try {

                // Force Polling
                if (__internalComplete.poll) this.poller.add(info)

                // Intercept Function Calls
                else if (typeof ref === 'function')  this.add('functions', info)
            
                // Trigger Getters
                else this.add('getters', info)
            } catch (e) {
                console.warn('Falling to polling:', path, e)
                this.poller.add(info)
            }
            

            subs[getPath('absolute', info)] = info.sub

            // Notify User of Initialization
            if (this.options.onInit instanceof Function) {
                const executionInfo = {}
                for (let key in info.infoToOutput) executionInfo[key] = undefined
                this.options.onInit(getPath('output', info), executionInfo)
            }
        }
    }

    add = (type, info) => {
        if (listeners[type])  listeners[type](info, this.listeners[type])
        else this.listeners[type][getPath('absolute', info)][info.sub] = info
    }

    // Unsubscribe from a subscription
    remove = (subs) => {

        // Clear All Subscriptions if None Specified
        if (!subs) {
            subs = 
            subs = {
                ...this.listeners.functions,
                ...this.listeners.getters,
                ...this.listeners.polling,
            }
        }


        if (typeof subs!== 'object') subs = { sub: subs }

        for (let key in subs) {

            let innerSub = subs[key]

            const handleUnsubscribe = (sub) => {
                const res = this.unsubscribe(sub)
                if (res === false) console.warn(`Subscription for ${key} does not exist.`, sub)
            }

            if (typeof innerSub !== 'symbol') iterateSymbols(innerSub, handleUnsubscribe)
            else handleUnsubscribe(innerSub)
        }

        return true 
    }

    unsubscribe = (sub) => {
            const absPath = this.listenerLookup[sub]

            // Remove from Polling listeners
            const polling = this.poller.get(sub)

            const funcs = this.listeners.functions[absPath]
            const func = funcs?.[sub]
            const getters = this.listeners.getters[absPath]
            const getter = getters?.[sub]

            if (polling) this.poller.remove(sub)
            
            // Reassign to Original Function
            else if (func) {
                delete funcs[sub]
                if (!Object.getOwnPropertySymbols(funcs).length) func.current = func.original
            }
            
            // Transition Back to Standard Object
            else if (getter) {
                delete getters[sub]
                if (!Object.getOwnPropertySymbols(getters).length) {
                    const parent = getter.parent
                    const last = getter.last
                    const value = parent[last]
                    Object.defineProperty(parent, last, { value })
                }
            } else return false

            delete this.listenerLookup[sub] // Remove from global listener collection
    }
}