import * as handlers from './handlers';
import * as check from '../../../common/check'

type Options = {
    type?: 'function' | 'object', 
    parent?: Inspectable
    name?:string,
    callback?: Inspectable['callback'],
    keySeparator?: '.' | string
}


const canCreate = (parent, key?, val?) => {

    try {
        if (val === undefined) val = parent[key]
    } catch (e) {
        return e
    }

    // Check if we already have a proxy
    if (parent[key] && parent[key][handlers.isProxy]) return false // Already a proxy


    const type = typeof val
    const isObject = type === 'object'
    const isFunction = type == 'function'
    

    // Only listen to objects and functions
    const onlyObjsAndFuncs = !val || !(isObject || isFunction )

    if (onlyObjsAndFuncs) return false

    if (val instanceof Element) return false // Avoid HTML elements
    if (val instanceof EventTarget) return false // Avoid HTML elements

    const isESM = isObject && check.esm(val)

    const getDesc = isObject && parent.hasOwnProperty(key)
    if (!getDesc && isFunction) return true
    else {
        
        const desc = Object.getOwnPropertyDescriptor(parent, key)

        if (desc &&((desc.value && desc.writable) || desc.set)) {
            if (!isESM) return true
            else console.warn('Cannot create proxy for ESM:', key, val)
        }
    }

    return false

}

export default class Inspectable {

    path: string[] = []
    parent?: Inspectable
    callback?: Function
    options: Options
    proxy: ProxyConstructor

    constructor ( target:any, opts:Options ={} ) {

        this.options = opts
        this.parent = opts.parent
        this.callback = opts.callback ?? this.parent?.callback
        if (this.parent) this.path = [...this.parent.path]
        if (opts.name) this.path.push(opts.name)
        let type = opts.type
        if (type != 'object') type = (typeof target === 'function')  ? 'function' : 'object';
        const handler =  handlers[`${type}s`](this)
        this.proxy = new Proxy(target, handler)
        

        
        // Create Nested Inspectable Proxies
        for (let key in target) this.create(key, target)
        return this.proxy as any // Replace class passed to the user with the proxy

    }

    check = canCreate

    create = (key, parent, val?) => {

        const create = this.check(parent, key, val)
        if (create instanceof Error) return // Could not access parent[key]
        else if (create) {
            if (val === undefined) val = parent[key] 
            parent[key] = new Inspectable(val, { ...this.options, name: key, parent: this })
        }

        return parent[key]
    }
}