import * as handlers from './handlers';
import * as check from '../../../common/check'
import { ArrayPath, ListenerRegistry, InspectableOptions } from '../types';
import * as standards from '../../../common/standards'
import { setFromPath } from '../../../common/pathHelpers';

export type InspectableProxy = ProxyConstructor & {
    __esProxy: ProxyConstructor,
    __esInspectable: Inspectable
}


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
    options: InspectableOptions
    proxy: ProxyConstructor
    listeners?: ListenerRegistry
    target: any

    state: {[x:string]: any} = {}

    constructor ( target:any = {}, opts: InspectableOptions ={}, name?, parent?) {

        // -------------- Only Listen to ES Components --------------

        if (target.__esProxy) this.proxy = target.__esProxy
        else {

            this.target = target
            this.options = opts
            this.parent = parent


            if (this.parent) {
                this.path = [...this.parent.path]
                this.state = this.parent.state ?? {} // Share state with the parent
            }

            if (name) this.path.push(name)
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
            Object.defineProperty(target, '__esInspectable', { value: this, enumerable: false })

            // Create Nested Inspectable Proxies
            for (let key in target) this.create(key, target, undefined, true)
        }

        return this.proxy as any // Replace class passed to the user with the proxy

    }

    set = (path, info, update) => {

        this.state[path] = {
            output: update,
            value: info,
        }

        // Set on Proxy Object
        setFromPath(path, update, this.proxy, { create: true });
    }

    check = canCreate

    create = (key, parent, val?, set = false) => {

        const create = this.check(parent, key, val)
        if (val === undefined) val = parent[key] 

        if (create && !(create instanceof Error)) {
            parent[key] = new Inspectable(val, this.options, key, this)
            return parent[key]
        }

        if (set) {
            try {
                this.proxy[key] = val ?? parent[key] // Notify on initialization
            } catch (e) {
                const isESM = check.esm(parent)
                const path = [...this.path, key]
                console.warn(`Could not set value (${path.join(this.options.keySeparator)})${isESM ? ' because the parent is an ESM.' : ''}`)
            }
        }
        return
    }
}