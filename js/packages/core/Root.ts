import ESComponent from "../../esc.spec"

import { keySeparator, specialKeys } from "../../../spec/properties"
import create, { resolve } from "./index"
import { from, is } from "./components"
import load from "./load"
import { all } from "../common/properties"
import { isNativeClass } from "../common/utils"
import { Options } from "../common/types"
import { Loaders } from "./types"

type RootInfo = {
    parent?: ESComponent,
    original: any,
    name?: string,
    loaders: Loaders
}

const globalRootRegistry = {}

export default class Root {

    name: string | symbol
    symbol: symbol
    root: symbol
    path: string
    options: Partial<Options>
    original: any
    states: any
    loaders: {
        available: Loaders
    } = {
        available: [],
    }

    get = (id) => {
        return globalRootRegistry[id]
    }

    components = {
        value: new Map(),
        queue: [],
        set: (key, value) => { 
            if (this.start.value) this.components.addedCallbacks.forEach(f => f(value))
            else this.components.queue.push(value)
            this.components.value.set(key, value)
        },

        values: function () { return this.value.values()},
        keys: function () { return this.value.keys()},
        entries: function () { return this.value.entries()},
        forEach: function (callback) { return this.value.forEach(callback)},

        get: function (key) { return this.value.get(key)},
        has: function (key) { return this.value.has(key)},
        delete: function (key) { 
            const got = this.value.get(key)
            if (got) {
                this.removedCallbacks.forEach(f => f(got))
                return this.value.delete(key)
            }
        },

        addedCallbacks: [],
        onAdded: function (callback) { this.addedCallbacks.push(callback) },
        
        removedCallbacks: [],
        onRemoved: function (callback) { this.removedCallbacks.push(callback) },
    }

    connected: boolean = false
    resolved: boolean = false

    // ---------- Creation Managers ----------
    create = function (esc) {
        const options = Object.assign({}, this.options)
        options.loaders = this.loaders.available
        return create(esc, undefined, options)
    }

    // ---------- Lifecycle Managers ----------
    stop = {
        name: 'stop',
        value: false,
        add: addCallback,
        run: () => runRecursive.call(this.stop, this.loaded.value),
        callbacks: {
            before: [],
            main: [],
            after: [],
        },
    }

    start = {
        name: 'start',
        value: false,
        add: addCallback,
        run: () => runRecursive.call(this.start, this.loaded.value),
        callbacks: {
            before: [],
            main: [],
            after: [],
        },
    }

    loaded = {
        value: false,
        callbacks: [],
        add: function (callback) {
            this.callbacks.push(callback)
            return true
        },
        run: function(resolved){
            if (resolved) this.value = resolved
            runSequentially(this.callbacks, [this.value])
        }
    }

    // Additional Loader Properties
    // boundEditors?: Editor[]
    // editor?: Editor,

    constructor(esc, info: RootInfo, options: Partial<Options>) {


        const { parent, original, name = Symbol('root'), loaders } = info


        // Specify the current path of the object
        const parentId = parent?.[specialKeys.root].path
        const path = (parentId) ? [parentId, name] : ((typeof name === 'string') ? [name] : [])
        const absolutePath = path.join(keySeparator)


        const ogRoot = esc[specialKeys.root]
        const ogSymbol = typeof ogRoot === 'symbol'
    
        const isSymbol = typeof name === 'symbol'
        const symbol = (ogSymbol) ? ogRoot : ((isSymbol) ? name : Symbol('root')) // A unique value to compare against (reuse names if possible)
        
        this.name = (isSymbol && ogSymbol) ? ogRoot : name
        this.symbol = symbol
        this.root = isSymbol ? name : parent[specialKeys.root].root // Set graph property
        this.path = absolutePath // Temporary Path Property
        this.options = options
        this.original = original
        this.states = {}
        this.loaders.available = loaders
        this.loaded.add(loadNestedComponents)

        globalRootRegistry[this.symbol] = this


        // Register children only when everything else is loaded
        this.start.add(() => {
            this.components.queue.forEach((o) => this.components.addedCallbacks.forEach(f => f(o)))
        })

        Object.defineProperty(esc, specialKeys.root, {
            value: this,
            enumerable: false,
            configurable: false,
            writable: false
        }) 
    }
}



function loadNestedComponents(esc) {

    const configuration = esc[specialKeys.root]
    
    // Resolve Nested Components
    const nested = from(esc)

    const promises = (nested) ? nested.map((info) => {
        const copy = Object.assign({}, configuration.options)
        const applyOptions = {
            name: info.name,
            opts: copy,
            parentObject: info.parent,
            parent: esc,
        }
        
        const name = applyOptions.name
        const ref = info.ref

        if (ref) {

            // Existing ES Component (reparent)
            if (ref.__?.symbol) {
                console.error('Has an existing component', ref.__.path)
                const parent = ref.__.parent
                if (parent) console.error(`Changing parent of existing component (${ref.__.path}) from ${parent.__.path} to ${configuration.path}`)
                ref.__.name = name // Update the name of a component. TODO: Make sure to check for side-effects
                ref.__parent = esc
            } 
            
            // New Component Template (load)
            else {

                const resolution = load(ref, configuration.loaders.available, applyOptions) // Apply loaders to nested components

                // Allow users to await the resolution of all children
                Object.defineProperty(info.parent[name], specialKeys.promise, { value: resolution, writable: false, })
            }
        } else {
            delete info.parent[name]
            console.error('No reference found for nested component', info)
        }
    }) : []

        // Allow the user to wait until all the chidren are resolved by awaiting the promise
        let isResolved
        const resolvePromise = new Promise(resolve => isResolved = async () => {
            configuration.resolved = true
            resolve(true)
        })

        Object.defineProperty(esc, `${specialKeys.resolved}`, { value: resolvePromise })
        configuration.resolved = false // To resolve the promise

        // Signal that the component is ready
        resolve(promises, () => isReady(esc, isResolved))
        
}


    // On Ready Callback
    function isReady (esc, isResolved) {

        const configuration = esc[specialKeys.root]

        // Add Stop Method
        configuration.stop.initial = esc[specialKeys.stop]
        esc[specialKeys.stop] = configuration.stop.run


        // Ensure all ES Properties are non-enumerable
        const keys = all(esc)
        for (let key of keys) {
            if (is(key)) {
                const desc = Object.getOwnPropertyDescriptor(esc, key)
                if (desc?.enumerable) Object.defineProperty(esc, key, { ...desc, enumerable: false })
            }
        }

        // Trigger Parent / Path Loader
        const finalParent = esc[specialKeys.parent]
        esc[specialKeys.parent] = finalParent

        isResolved()
    }


// -------- Basic Helper Function --------
const run = (f, context, args, x?) => resolve(x, () => f.call(context, ...args))

const runSequentially = (callbacks: Function[], args: any[] = [], context?) => {
    if (callbacks.length) {
        return callbacks.reduce((x,f) => run(f, context, args), undefined) // Must use undefined as the second argument to trigger the first callback
    }

}

function addCallback(callback, priority: 'before' | 'after' | 'main' = 'main') {
    const { callbacks } = this
    callbacks[priority].push(callback)
    return true
}

function runRecursive(resolved) {
    const { callbacks, name } = this

    if (!this.value) {

        const isStop = name === 'stop'

        const configuration = resolved[specialKeys.root]

        const callback = isStop ? configuration.stop.initial : resolved[specialKeys[name]]
        this.value = true


        if (!isStop) configuration.stop.value = false

        const toCall = (callback && !isStop) ? [...callbacks.before, callback, ...callbacks.main] : [...callbacks.before, ...callbacks.main]

        const result = runSequentially(toCall, [resolved], resolved)
        return resolve(result, () => {

            const hierarchy = Array.from(resolved[specialKeys.root].components.entries()) as [string, ESComponent][]

            // Initialize Nested Components (and wait for them to be done)
            const ranOnChildren = resolve(hierarchy.map(async ([tag, component]) => {
                const promise = component[specialKeys.promise]
                if (promise && typeof promise.then === 'function') component = hierarchy[tag] = await promise // Wait for the component to be ready

                return await component[specialKeys.root][name].run() // Run the component start / stop function
            }))

            return resolve(ranOnChildren, () => {

                // After All Components Resolved
                const result = runSequentially(callbacks.after, [resolved], resolved)
                return resolve(result, () => {

                    // Call Final Function or Return
                    if (isStop) {
                        if (callback) callback.call(resolved, resolved) // Run general stop function last
                        configuration.start.value = false // Can be restarted
                    }

                    return true
                })
            })
        })
    }
}


