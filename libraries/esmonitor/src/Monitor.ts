import * as check from '../../common/check.js'
import Poller from './Poller.js'

import { Options } from '../../common/types'
import { PathFormat, ListenerInfo, InternalOptions, ListenerRegistry, ListenerLookup, ArrayPath, ListenerOptions, MonitorOptions } from './types'
import * as listeners from './listeners'
import { iterateSymbols, getPath } from './utils.js'
import { drillSimple } from '../../common/drill.js'
import { getFromPath, setFromPath } from '../../common/pathHelpers.js'
import { isProxy } from './inspectable/handlers.js'
import Inspectable from './inspectable/index.js'

import * as standards from '../../common/standards'

const fallback = 'esComponents'

export default class Monitor {

    poller = new Poller()

    options: MonitorOptions = {
        pathFormat: 'relative',
        keySeparator: standards.keySeparator,
    }
    
    listenerLookup: ListenerLookup = {}
    listeners: ListenerRegistry = {
        polling: this.poller.listeners,
        functions: {},
        setters: {},
    }

    references: {
        [x:string | symbol]: {
            [x:string | symbol]: any
        }
    } = {}

    constructor(opts:Partial<MonitorOptions>={}){
        Object.assign(this.options, opts)
        this.poller.setOptions(opts.polling)
    }

    get = (path, output?) => getFromPath(this.references, path, {
        keySeparator: this.options.keySeparator,
        fallbacks: [fallback],
        output
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


    getInfo = (id, type, callback, path, original) => {
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
            console.warn('Falling back to using function interception and setters...')
        }


        let isInspectable = baseRef[isProxy]


        if (isDynamic && !isInspectable) {
            
            const inspector = new Inspectable(baseRef, {
                keySeparator: this.options.keySeparator,
                listeners: this.listeners,
                path: (path) => path.filter((str) => str !== fallback)
            })

            this.set(id, inspector) // reset reference
            baseRef = inspector
            isInspectable = true
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
            drillSimple(ref, (key, val, drillInfo) => {
                if (drillInfo.pass) return 
                else {
                    const fullPath = [...arrayPath, ...drillInfo.path]
                    const internalSubs = this.listen(id, callback, fullPath, options, __internalComplete) // subscribe to all
                    Object.assign(subs, internalSubs)
                }
            }, {
                condition: (_, val) => toMonitorInternally(val)
            })
        } 

        // Option #2: Subscribe to specific property
        else {

            let info;
            try {
                
                // Force Polling
                if (__internalComplete.poll) {
                    info = this.getInfo(id, 'polling', callback, arrayPath, ref)
                    this.poller.add(info)
                }

                // Direct Methods
                else {

                    let type = 'setters' // trigger setters
                    if (typeof ref === 'function') type = 'functions' // intercept function calls
                    info = this.getInfo(id, type, callback, arrayPath, ref)
                    this.add(type, info, !isInspectable)
                }
                
            } catch (e) {
                console.warn('Falling to polling:', path, e)
                info = this.getInfo(id, 'polling', callback, arrayPath, ref)
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

    add = (type, info, monitor = true) => {
        if (listeners[type]) listeners[type](info, this.listeners[type], monitor)
        else this.listeners[type][getPath('absolute', info)][info.sub] = info
    }

    // Unsubscribe from a subscription
    remove = (subs) => {

        // Clear All Subscriptions if None Specified
        if (!subs) {
            subs = 
            subs = {
                ...this.listeners.functions,
                ...this.listeners.setters,
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
            const setters = this.listeners.setters[absPath]
            const setter = setters?.[sub]

            if (polling) this.poller.remove(sub)
            
            // Reassign to Original Function
            else if (func) {
                delete funcs[sub]
                if (!Object.getOwnPropertySymbols(funcs).length) func.current = func.original
            }
            
            // Transition Back to Standard Object
            else if (setter) {
                delete setters[sub]
                if (!Object.getOwnPropertySymbols(setters).length) {
                    const parent = setter.parent
                    const last = setter.last
                    const value = parent[last]
                    Object.defineProperty(parent, last, { value })
                }
            } else return false

            delete this.listenerLookup[sub] // Remove from global listener collection
    }
}