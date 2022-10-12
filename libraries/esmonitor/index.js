import * as check from '../common/check.js'


const isSame = (a,b) => {
    if (a && typeof a === 'object') {
        const jA = JSON.stringify(a)
        const jB = JSON.stringify(b)
        return jA === jB
    } else return a === b
}

const defaultSamplingRate = 60

export default class Monitor {

    listeners = {
        polling: {},
        functions: {},
        getters: {},
    }

    references = {}

    #pollingId
    #sps
    polling = Object.defineProperties({}, {
        sps: {
            get: () => this.#sps,
            set: (sps) => {
                this.#sps = sps
                if (this.#pollingId) clearInterval(this.#pollingId)
                this.#pollingId = setInterval(this.poll, 1000/sps)
            },
            enumerable: true,
        }
    })

    constructor(opts={}){

        // Merge polling options
        if (opts.polling) for (let key in opts.polling) this.polling[key] = opts.polling[key]

        this.sps = defaultSamplingRate
    }

    // Poll for changes in an ES Module
    poll = () => {
        const listeners = this.listeners.polling
        for(let sym of Object.getOwnPropertySymbols(listeners) ) {
            let {fullPath, callback, accessor, history, path} =listeners[sym]
            const ref = accessor()
            if (!isSame(ref, history)){
                callback(fullPath, ref)
                listeners[sym].history = (typeof ref === 'object') ? Object.assign({}, ref) : ref
            }
        }
    }

    listen = (id, callback, opts = {}) => {

        const { reference } = opts

        if (!opts.poll) opts.poll = check.esm(reference) // Inherit ESM status

        const forcePoll = opts.poll
        let path = opts.path ?? []

        // Set Reference
        if (!this.references[id]) this.references[id] = reference // Setting base reference

        // Drill Reference based on Path
        let accessor = () => {
            let ref =  this.references[id]
            path.forEach(str => {
                if (str in ref) ref = ref[str]
                else throw new Error(`Invalid path: ${path}`, this.references[name])
            })
            return ref
        }

        // Create listeners for Objects
        let ref = accessor()

        const toMonitorInternally = (val, allowArrays=false) => {
            const first = val && typeof val === 'object'
            if (!first) return false
            else if (allowArrays) return true
            else return !Array.isArray(val)
        }

        const createInfo = (path, reference) => {
            const fullPath = path.join('.')
            return {id, fullPath, callback, accessor, path, history: (typeof reference === 'object') ? Object.assign({}, reference) : reference}
        }

        // ------------------ Create Subscription ------------------

        // Option #1: Subscribe to each object property individually
        if (toMonitorInternally(ref, true)) {
            let subs = {}
            const drill = (obj, path=[]) => {
                for (let key in obj) {
                    const val = obj[key]
                    const newPath = [...path, key]
                    if (toMonitorInternally(val)) drill(val, newPath) 
                    else {
                        if (typeof val === 'function') {
                            if (forcePoll) {
                                console.warn(`Skipping subscription to ${[id, ...newPath].join('.')} since its parent is ESM.`)
                            } else {
                                const info = createInfo(newPath, obj)
                                const sub = this.monitorFunction(info)
                                Object.assign(subs, sub)
                            }
                        } else {
                            const internalSubs = this.listen(id, callback, { ...opts, path: newPath }) // subscribe to all
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

            const info = createInfo(path, ref)
            const sub = info.sub = Symbol('subscription')

            try {

                // Force Polling
                if (forcePoll) this.listeners.polling[sub] = info

                // Intercept Function Calls
                else if (typeof ref === 'function') this.monitorFunction(info)
            
                // Trigger Getters
                else {

                        let ref = this.references[info.id]
                        const path = [...info.path]
                        let last = path.pop()
                        path.forEach(key => ref = ref[key])
                        let val = ref[last]
                        Object.defineProperty(ref, last, {
                            get: () => val,
                            set: (v) => {
                                info.callback(info.fullPath, v)
                                val = v
                            },
                            enumerable: true
                        })

                        this.listeners.getters[sub] = {
                            ref,
                            last
                        }
                }
            } catch (e) {
                console.warn('Fallback to polling', e)
                this.listeners.polling[sub] = info
            }
            

            return {
                [info.path.join('.')]: sub
            }
        }
    }

    // Monitor a function for outputs
    monitorFunction = (info) => {

        let ref = this.references[info.id]
        const path = [...info.path]
        let last = path.pop()
        path.forEach(key => ref = ref[key])
        const original = ref[last]
        
        // Intercept Function Call
        ref[last] = function(...args) {
            const output = original.call(this, ...args)
            info.callback(info.fullPath, output)
            return output
        }

        this.listeners.functions[info.sub] = {
            ref,
            last,
            original
        }

    }

    // Unsubscribe from a subscription
    stop = (subs) => {

        if (typeof subs!== 'object') subs = { sub: subs }

        for (let key in subs) {
            const sub = subs[key]

            // Remove from Polling listeners
            const polling = this.listeners.polling[sub]
            if (polling) {
                delete this.listeners.polling[sub]
                return true
            } 
            
            // Reassign to Original Function
            const func = this.listeners.functions[sub]
            if (func) {
                func.ref[func.last] = func.original
                delete this.listeners.functions[sub]
                return true
            }
            
            // Transition Back to Standard Object
            const getter = this.listeners.getters[sub]
            if (getter) {
                const ref = getter.ref
                const last = getter.last
                const value = ref[last]
                Object.defineProperty(ref, last, { value })
                delete this.listeners.getters[sub]
                return true
            }

        }
    }
}