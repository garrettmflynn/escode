import * as handlers from './handlers';
import * as check from '../../../common/check'
import { ArrayPath, ListenerRegistry, InspectableOptions } from '../types';
import * as standards from '../../../common/standards'


const canCreate = (parent, key?, val?) => {

    try {
        if (val === undefined) val = parent[key]
    } catch (e) {
        return e
    }

    // Check if we already have a proxy
    const alreadyIs = parent[key] && parent[key][handlers.isProxy]
    if (alreadyIs) return false // Already a proxy


    const type = typeof val
    const isObject = type === 'object'
    const isFunction = type == 'function'
    

    // Only listen to objects and functions
    const notObjOrFunc = !val || !(isObject || isFunction )
    if (notObjOrFunc) return false

    if (val instanceof Element) return false // Avoid HTML elements
    if (val instanceof EventTarget) return false // Avoid HTML elements

    const isESM = isObject && check.esm(val)

    if (isFunction) return true
    else {
        
        const desc = Object.getOwnPropertyDescriptor(parent, key)

        if (desc &&((desc.value && desc.writable) || desc.set)) {
            if (!isESM) return true
            else console.warn('Cannot create proxy for ESM:', key, val)
        } else if (!parent.hasOwnProperty(key)) return true
    }

    return false

}

export default class Inspectable {

    path: ArrayPath = []
    parent?: Inspectable
    callback?: Function
    options: InspectableOptions
    proxy: ProxyConstructor
    listeners?: ListenerRegistry
    target: any

    constructor ( target:any, opts: InspectableOptions ={} ) {

        // -------------- Only Listen to ES Components --------------

        if (target.__esProxy) this.proxy = target.__esProxy
        else {

            this.target = target
            this.options = opts
            // if (!this.options.depth) this.options.depth = 0
            this.parent = opts.parent
            this.callback = opts.callback ?? this.parent?.callback
            if (this.parent) this.path = [...this.parent.path]
            if (opts.name) this.path.push(opts.name)
            if (opts.listeners) this.listeners = opts.listeners

            if (opts.path) {
                if (opts.path instanceof Function) this.path = opts.path(this.path)
                else if (Array.isArray(opts.path)) this.path = opts.path
                else console.log('Invalid path', opts.path)
            }


            if (!this.options.keySeparator) this.options.keySeparator = standards.keySeparator

            let type = opts.type
            if (type != 'object') type = (typeof target === 'function')  ? 'function' : 'object';
            const handler =  handlers[`${type}s`](this)

            this.proxy = new Proxy(target, handler)
            Object.defineProperty(target, '__esProxy', { value: this.proxy, enumerable: false })
        
            // Create Nested Inspectable Proxies
            for (let key in target) this.create(key, target, undefined)
        }

        return this.proxy as any // Replace class passed to the user with the proxy

    }

    check = canCreate

    create = (key, parent, val?) => {

        const create = this.check(parent, key, val)
        if (create && !(create instanceof Error)) {
            if (val === undefined) val = parent[key] 
            parent[key] = new Inspectable(val, { ...this.options, name: key, parent: this })
            return parent[key]
        }

        return
    }
}