import * as check from '../../common/check.js'
import Poller from './Poller.js'
import { ListenerInfo, InternalOptions, MonitorOptions, ListenerPool, ListenerLookup } from './types'
import * as listeners from './listeners'
import { iterateSymbols } from './utils.js'


export default class Monitor {

    poller = new Poller()

    options = {
        pathFormat: 'relative',
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

    references = {}

    constructor(opts:MonitorOptions={}){
        Object.assign(this.options, opts)
        this.poller.setOptions(opts.polling)
    }

    get = (path) => {
        if (typeof path === 'string') path = path.split('.')
        path = [...path]

        let ref =  this.references
        path.forEach(str => {
            if (str in ref) ref = ref[str]
            else {
                console.error(`Could not get path: ${path.join('.')}`)
                return
            }
        })
        return ref
    }

    set = (path, value) => {

        if (typeof path === 'string') path = path.split('.')
        path = [...path]

        let ref =  this.references

        const copy = [...path]
        const last = copy.pop()
        copy.forEach(str => {
            if (str in ref) ref = ref[str]
            else {
                console.error(`Could not set path: ${path.join('.')}`)
                return
            }
        })

        ref[last] = value
    }

    // A simple wrapper for listen()
    on = (absPath, callback) => {
        const split = absPath.split('.')
        const id = split[0]
        return this.listen(id, callback, split.slice(1))
    }


    createInfo = (id, callback, path, original) => {
        if (typeof path === 'string') path = path.split('.')
        const relativePath = path.join('.')

        const refs = this.references
        const get = this.get
        const set = this.set

        const info = {
            id, 
            path: {
                absolute: [id, ...path].join('.'),
                relative: relativePath,
                parent: [id, ...path.slice(0,-1)].join('.')
            }, 
            callback, 
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

        info.path.output = info.path[this.options.pathFormat]

        this.listenerLookup[info.sub] = info.path.absolute

        return info
    }

    listen = (id, callback, path: string | string[] = [], __internal: InternalOptions = {}) => {

        const reference = this.references[id]

        if (!reference) {
            console.error(`Reference ${id} does not exist.`)
            return
        }

        if (!__internal.poll) __internal.poll = check.esm(reference) // Inherit ESM status

        // Set Reference
        if (!this.references[id]) this.references[id] = reference // Setting base reference

        // Drill Reference based on Path
        let ref = this.get([id, ...path])

        // Create listeners for Objects
        const toMonitorInternally = (val, allowArrays=false) => {
            const first = val && typeof val === 'object'
            if (!first) return false
            else if (allowArrays) return true
            else return !Array.isArray(val)
        }

        // ------------------ Create Subscription ------------------

        // Option #1: Subscribe to each object property individually
        if (toMonitorInternally(ref, true)) {
            let subs = {}

            const drill = (
                obj, 
                path: string[] = []
            ) => {
                for (let key in obj) {
                    const val = obj[key]
                    const newPath = [...path, key]
                    if (toMonitorInternally(val)) drill(val, newPath) 
                    else {
                        if (typeof val === 'function') {
                            if (__internal.poll) {
                                console.warn(`Skipping subscription to ${[id, ...newPath].join('.')} since its parent is ESM.`)
                            } else {
                                const info = this.createInfo(id, callback, newPath, val)
                                this.add('functions', info)
                                subs[info.path.absolute] = info.sub
                            }
                        } else {
                            const internalSubs = this.listen(id, callback, newPath, __internal) // subscribe to all
                            Object.assign(subs, internalSubs)
                        }
                    }
                }
            }

            drill(ref)
            return subs
        } 

        // Option #2: Subscribe to specific property
        else {

            const info = this.createInfo(id, callback, path, ref)

            try {

                // Force Polling
                if (__internal.poll) this.poller.add(info)

                // Intercept Function Calls
                else if (typeof ref === 'function')  this.add('functions', info)
            
                // Trigger Getters
                else this.add('getters', info)
            } catch (e) {
                console.warn('Fallback to polling', e)
                this.poller.add(info)
            }
            

            return {
                [info.path.absolute]: info.sub
            }
        }
    }

    add = (type, info) => {
        if (listeners[type])  listeners[type](info, this.listeners[type])
        else this.listeners[type][info.path.absolute][info.sub] = info
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