import * as check from '../../common/check.js'
import Poller from './Poller.js'

import { PathFormat, InternalOptions, ListenerRegistry, ArrayPath, MonitorOptions, SetFromOptionsType } from './types'
import * as listeners from './listeners'
import { iterateSymbols, getPath, getPathInfo } from './utils.js'
import { drillSimple } from '../../common/drill.js'
import { getFromPath } from '../../common/pathHelpers.js'

import * as standards from '../../esc/standards'
import { setFromOptions } from './optionsHelpers.js'

const createLookup = () => {
    return { symbol: {}, name: {} }
}

export default class Monitor {

    poller = new Poller()

    options: MonitorOptions = {
        pathFormat: 'relative',
        keySeparator: standards.keySeparator,
    }
    
    listeners: ListenerRegistry = {
        polling: this.poller.listeners,
        functions: {},
        setters: {},
        lookup: createLookup()
    }

    references: {
        [x:string | symbol]: {
            [x:string | symbol]: any
        }
    } = {}

    constructor(opts:Partial<MonitorOptions>={}){

        // Make listener lookup non-enumerable
        Object.defineProperty(this.listeners, 'lookup', {
            value: createLookup(),
            enumerable: false,
            configurable: false
        })

        Object.assign(this.options, opts)
        this.poller.setOptions(opts.polling)
    }

    get = (path, output?, reference = this.references, throwError = true) => {

        return getFromPath(reference, path, {
            keySeparator: this.options.keySeparator,
            fallbacks: this.options.fallbacks,
            output
        }, throwError)
    }

    set = (path, value, opts: SetFromOptionsType= {}) => {
        const optsCopy = {...opts}
        if (!optsCopy.reference) optsCopy.reference = this.references
        if (!optsCopy.listeners) optsCopy.listeners = this.listeners

        return setFromOptions(path, value, this.options, optsCopy)
    }

    // A simple wrapper for listen()
    on = (absPath: PathFormat, callback) => {
        const info = getPathInfo(absPath, this.options)
        return this.listen(info.id, callback, info.path)
    }


    getInfo = (label, callback, path, original) => {

        const info = listeners.info(label, callback, path, original, this.references, this.listeners, this.options)
        const id = Math.random()
        const lookups = this.listeners.lookup
        const name = getPath('absolute', info)
        lookups.symbol[info.sub] = {
            name,
            id
        }

        if (!lookups.name[name]) lookups.name[name] = {}
        lookups.name[name][id] = info.sub
        
        return info
    }

    listen = (id, callback, path: PathFormat = [], __internal: Partial<InternalOptions> = {}) => {


        if (typeof path === 'string') path = path.split(this.options.keySeparator)
        else if (typeof path === 'symbol') path = [path]

        const arrayPath = path as ArrayPath

        let baseRef = this.get(id)

        if (!baseRef) {
            console.error(`Reference does not exist.`, id)
            return
        }


        if (!__internal.poll) __internal.poll = check.esm(baseRef) // Inherit ESM status
        if (!__internal.seen) __internal.seen = []

        const __internalComplete = __internal as InternalOptions

        // Drill Reference based on Path
        const thisPath = [id, ...arrayPath]
        const ref = this.get(thisPath)


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

        // Case #1: Subscribe to each object property individually
        let subs = {}
        let success = false
        const subscribeAll = toMonitorInternally(ref, true)
        if (subscribeAll) {

            if (ref.__esInspectable) ref.__esInspectable.options.globalCallback = callback

            drillSimple(ref, (_, __, drillInfo) => {
                if (drillInfo.pass) return 
                else {
                    const fullPath = [...arrayPath, ...drillInfo.path]
                    const internalSubs = this.listen(id, callback, fullPath, __internalComplete) // subscribe to all
                    Object.assign(subs, internalSubs)
                }
            }, {
                condition: (_, val) => toMonitorInternally(val)
            })

            success = true
        } 

        // Case #2: Subscribe to specific property
        let info;
        try {
            
            // Force Polling
            info = this.getInfo(id, callback, arrayPath, ref)

            if (info && !success) {
                if (__internalComplete.poll) success = this.poller.add(info)

                // Direct Methods
                else {

                    let type = 'setters' // trigger setters
                    if (typeof ref === 'function') type = 'functions' // intercept function calls

                    success = this.add(type, info)
                }
            }
            
        } catch (e) {
            console.error('Fallback to polling:', path, e)
            success = this.poller.add(info)
            // __internalComplete.poll = true
        }
        

        if (success) {
            subs[getPath('absolute', info)] = info.sub

            // Notify User of Initialization
            if (this.options.onInit instanceof Function) {
                const executionInfo = {}
                for (let key in info.infoToOutput) executionInfo[key] = undefined
                this.options.onInit(getPath('output', info), executionInfo)
            }

            return subs
        } else {
            console.error('Failed to subscribe to:', path)
            return
        }
    }

    add = (type, info) => {
        if (listeners[type]) return listeners[type](info, this.listeners, this.listeners.lookup)
        else {
            this.listeners[type][getPath('absolute', info)][info.sub] = info
            return true
        }
    }

    // Unsubscribe from a subscription
    remove = (subs) => {

        // Clear All Subscriptions if None Specified
        if (!subs) {
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
            const info = this.listeners.lookup.symbol[sub]
            const absPath = info.name

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
                if (!Object.getOwnPropertySymbols(funcs).length) {
                    Object.defineProperty(func.parent, func.last, {
                        value: func.original,
                        writable: true
                    })
                    delete this.listeners.functions[absPath]
                }
            }
            
            // Transition Back to Standard Object
            else if (setter) {
                delete setters[sub]
                if (!Object.getOwnPropertySymbols(setters).length) {
                    const parent = setter.parent
                    if (parent) {
                        const last = setter.last
                        const value = parent[last] // Parent always exists!
                        Object.defineProperty(parent, last, { value, writable: true })
                    }
                    delete this.listeners.setters[absPath]
                }
            } else return false

            delete this.listeners.lookup.symbol[sub] // Remove from global listener collection

            const nameLookup = this.listeners.lookup.name[info.name]
            delete nameLookup[info.id]
            if (!Object.getOwnPropertyNames(nameLookup).length )delete this.listeners.lookup.name[info.name]

    }
}