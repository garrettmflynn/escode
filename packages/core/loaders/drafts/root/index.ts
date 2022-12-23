import { ESComponent } from "../../../../../spec"
import { keySeparator, specialKeys } from "../../../../../spec/standards"
import create, { resolve } from "../../../index"

export const name = 'root'

export const required = true

export const properties = {
    dependents: [specialKeys.isGraphScript]
}

function rootLoader (esc, options, additionalInfo) {

    const val = createGraphScriptRoot(additionalInfo.name, options, additionalInfo)

    Object.defineProperty(esc, specialKeys.isGraphScript, {
        value: val,
        enumerable: false,
        configurable: false,
        writable: false
    })    

    return esc
}


export default rootLoader


function createGraphScriptRoot(name, options, additionalInfo) {

    const { parent, original, loaders } = additionalInfo

    const isSymbol = typeof name === 'symbol'

    // Specify the current path of the object
    const parentId = parent?.[specialKeys.isGraphScript].path
    const path = (parentId) ? [parentId, name] : ((typeof name === 'string') ? [name] : [])
    const absolutePath = path.join(keySeparator)
        
    const __ = {

        // ---------- Identifiers ----------
        name,
        symbol: Symbol('isGraphScript'), // A unique value to compare against

        // ---------- Relative Position ----------
        root: isSymbol ? name : parent[specialKeys.isGraphScript].root, // Set graph property
        path: absolutePath, // Temporary Path Property

        // ---------- Instantiation Options ----------
        options,

        // ----------Original Instantiation Configuration Object ----------
        original,

        // ---------- Loader State Tracker ----------
        // TODO: Make sure the loaders are using this so it can be tracked!
        states: {},

        // ---------- Nested Components Map ----------
        components: new Map(),
        connected: false,
        resolved: false,

        // ---------- Creation Managers ----------
        create: (esc) => {
            if (!options.loaders) options.loaders = loaders // re-apply loaders to the options
            return create(esc, undefined, options)
        },

        // ---------- Lifecycle Managers ----------
        stop: {
            name: 'stop',
            value: false,
            add: addCallback,
            callbacks: {
                before: [],
                main: [],
                after: [],
            },
        },

        start: {
            name: 'start',
            value: false,
            add: addCallback,
            callbacks: {
                before: [],
                main: [],
                after: [],
            },
        },

    } as ESComponent['__']

    const toRunProxy = function () { return runRecursive.call(this, __.ref) }
    __.start.run = toRunProxy.bind(__.start)
    __.stop.run = toRunProxy.bind(__.stop)

    return __
}

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

        const configuration = resolved[specialKeys.isGraphScript]

        const callback = isStop ? configuration.stop.initial : resolved[specialKeys[name]]
        this.value = true


        if (!isStop) configuration.stop.value = false

        const toCall = (callback && !isStop) ? [...callbacks.before, callback, ...callbacks.main] : [...callbacks.before, ...callbacks.main]

        const result = runSequentially(toCall, [resolved], resolved)
        return resolve(result, () => {

            const hierarchy = Array.from(resolved[specialKeys.isGraphScript].components.entries()) as [string, ESComponent][]

            // Initialize Nested Components (and wait for them to be done)
            const ranOnChildren = resolve(hierarchy.map(async ([tag, component]) => {
                const promise = component[specialKeys.promise]
                if (promise && typeof promise.then === 'function') component = hierarchy[tag] = await promise // Wait for the component to be ready

                return await component[specialKeys.isGraphScript][name].run() // Run the component start / stop function
            }))

            return resolve(ranOnChildren, () => {

                // After All Components Resolved
                const result = runSequentially(callbacks.after, [resolved], resolved)
                return resolve(result, () => {

                    // Call Final Function or Return
                    if (isStop) {
                        if (callback) callback.call(resolved, resolved) // Run general stop function last

                        // Clear all listeners below esc node
                        resolved[specialKeys.listeners.value].clear()

                        // Clear all listeners above the Component that reference it
                        const path = resolved[specialKeys.isGraphScript].path
                        let target = resolved
                        const parent = target[specialKeys.parent]
                        while (parent && parent[specialKeys.isGraphScript] !== undefined) {
                            const res = target[specialKeys.parent] // parent is a component
                            if (res) {
                                target = res
                                if (target) {
                                    const configuration = target[specialKeys.isGraphScript]
                                    if (configuration) target[specialKeys.listeners.value].clear(path)
                                }
                            } else break
                        }

                        configuration.start.value = false // Can be restarted
                    }

                    return true
                })
            })
        })
    }
}
