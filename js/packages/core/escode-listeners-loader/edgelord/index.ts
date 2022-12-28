// import { Graph } from "../../../Graph2"

import { keySeparator, specialKeys } from '../../../../../spec/properties'
import Monitor from '../../../esmonitor/src'


// Special Key Definition
const defaultPath = specialKeys.default
const operatorPath = specialKeys.operator

// Symbols to Recognize
const listenerObject = Symbol('listenerObject')
const toSet = Symbol('toSet')
const subscriptionKey = Symbol('subscriptionKey')
const configKey = Symbol('configKey')
// const toResolveWithKey = Symbol('toResolveWithKey')

// Configuration Options
const isConfigObject = (o) => specialKeys.listeners.format in o 
                            || specialKeys.listeners.branch in o 
                            || specialKeys.listeners.trigger in o 
                            // || specialKeys.listeners.bind in o


// Global References
class Edgelord {

    monitor = new Monitor()
    graph: any // Graph
    #contexts: { [x:symbol | string]: {
        started: boolean,
        queue: Function[],
        callbacks: Function[],
        active: {[x:string]: any},
        update: Function,
    } } = {}

    constructor (listeners?, rootPath?) {
        if (listeners) this.register(listeners, rootPath)
    }

    setReference(id: string | symbol, ref: any) {
        this.monitor.set(id, ref)
    }

    getContext = (id) => {
        if (!this.#contexts[id]) this.#contexts[id] = {
            started: false, 
            queue: [], 
            active: {} , 
            callbacks: [],
            update: function (...args) { this.callbacks.forEach(f => f(...args)) }
        }
        return this.#contexts[id]
    }

    // Register onstart callbacks
    onStart = (f, id) => {
        const context = this.getContext(id)
        if (context.started) f()
        else context.queue.push(f)
    }

    onUpdate = (f, id) => {
        const context = this.getContext(id)
        context.callbacks.push(f)
    }


    runEachListener = (listeners, callback, rootPath) => {
        if (!callback) return
        for (const first in listeners) {
            const second = listeners[first]

            if (!second) {
                console.warn('Skipping empty listener:', first)
                continue;
            }

            // NOTE: Listener sheets are to / from
            if (second && typeof second === 'object') {
                const from = second
                const to = first
                for (let fromPath in from) {
                    callback(
                        fromPath,  // From Path
                        to, // To Path
                        from[fromPath], // Value,
                        rootPath // ID
                    )
                }
            } 
            
            // Immediate Absolute Paths Only
            // NOTE: Direct listeners are from / to
            else {
                const from = first
                const to = second

                const typeOf = typeof to
                if (typeOf === 'function') callback(from, '',  to, rootPath)
                else if (typeOf === 'string') callback(from, to, to, rootPath)
                else console.error('Improperly Formatted Listener', to, rootPath)
            }
        }
    }

    register = (listeners, rootPath) =>  this.runEachListener(listeners, this.add, rootPath)


    start = (listeners, rootPath) => {
        const id = rootPath[0]
        const context = this.getContext(id)
        this.register(listeners, rootPath)
        context.started = true
        context.queue.forEach(f => f())
    }

    #getAbsolutePath = (name, rootPath) => {
        const split =  name.split(keySeparator)
        return [...rootPath, ...split].filter(str => str !== '')
    }

    #getPathInfo = (path, rootPath: string[]) => {

        const output = {
            absolute: {},
            relative: {}
        } as any

        // Transform name to absolute 
        output.absolute.array = this.#getAbsolutePath(path, rootPath)
        output.relative.array = output.absolute.array.slice(1)

        let obj = this.monitor.get(
            output.absolute.array,  // For General Use
            undefined, 
            // this.context.instance, 
        ) // Allow for getting properties


        // // Fallback to direct graph reference
        // if (this.context.graph) {

        //     // Correct for paths that are relative to the bound object
        //     if (obj && this.context.bound) {
        //         output.absolute.array = [this.context.id, this.context.bound, ...output.absolute.array.slice(1)]
        //         output.relative.array.unshift(this.context.bound)
        //     } 
            
        //     // Assume you are targeting the global graph
        //     else if (!obj) {
        //         const rel = output.relative.array.join(keySeparator)
        //         obj = this.context.graph.get(rel)
        //     }
        // }
        
        const isGraphScript = obj && typeof obj === 'object' && specialKeys.root in obj

        // Fallback to default updates
        const useOperator = obj && isGraphScript && obj[operatorPath]
        const useDefault = obj && obj[defaultPath]
        const extraPath = (useOperator) ? operatorPath : (useDefault) ? defaultPath : undefined
        if (extraPath) {
            output.absolute.array.push(extraPath)
            output.relative.array.push(extraPath)
        }

        output.absolute.value = output.absolute.array.slice(1).join(keySeparator) // update path
        output.relative.value = output.relative.array.join(keySeparator) // update path
        
        return output
    }

    add = (from, to, value: any = true, rootPath, subscription?) => {
        
        if (!Array.isArray(rootPath)) rootPath = [rootPath]
        const id = rootPath[0]


        if (!value) return // Any non-truthy value is not accepted

        const fromInfo = this.#getPathInfo(from, rootPath)
        const toInfo = this.#getPathInfo(to, rootPath)

        // Check global for subscription
        const absPath = fromInfo.absolute.value
        const context = this.getContext(id)
        if (!subscription) subscription = context.active[absPath]?.[subscriptionKey]

        // Only subscribe once
        if (!subscription) {
            subscription =this.monitor.on(fromInfo.absolute.array, (path, info, update) => this.update(path, update, info.id))
        } 

        // Use updated string value if modified
        if (typeof value == 'string') value = toInfo.absolute.array.slice(1).join(keySeparator)

        const parent = this.monitor.get(toInfo.absolute.array.slice(0,-1))
        const info = {
            value,
            bound: parent, // Automatically bind to the parent object
            [listenerObject]: true
        }

        if(!context.active[absPath]) context.active[absPath] = {}
        const base = context.active[absPath]
        if (!base[subscriptionKey]) {
            Object.defineProperty(base, subscriptionKey, {
                value: subscription,
                configurable: true
            })
        }
        base[toInfo.absolute.value] = info

        return info
    }

    // Local removal
    remove = (from, to, rootPath) => {
        if (!Array.isArray(rootPath)) rootPath = [rootPath]
        const id = rootPath[0]

        const fromInfo = this.#getPathInfo(from, rootPath)
        const toInfo = this.#getPathInfo(to, rootPath)

        const path = [fromInfo.absolute.value, toInfo.absolute.value]

        const context = this.getContext(id).active

        let base = context[path[0]]

        if (typeof base === 'object') {
            delete base[path[1]] // complex listener
            if (Object.keys(base).length === 0) {
                delete context[path[0]]
                const sub = base[subscriptionKey]
                if (sub) {
                    this.monitor.remove(sub, id) // Cleaning up subscriptions (active only)
                }
                delete base[subscriptionKey]
            }

        } else delete context[path[0]] // simple listener

    }

    // Local clearing
    clear = (name = '', rootPath = []) => {

        if (!Array.isArray(rootPath)) rootPath = [rootPath]

        const id = rootPath[0]
        const value = [...name.split(keySeparator), ...rootPath.filter(s => typeof s !== 'symbol')].filter(s => s !== '').join('.')
        const context = this.getContext(id).active

        Object.keys(context).forEach(from => {
            Object.keys(context[from]).forEach(to => {

                if (
                    !value
                    || from.slice(0, value.length) === value // Matches from
                    || to.slice(0, value.length) === value // Matches to
                ) this.remove(from, to, id)
            })
        })
    }

    has = (from, id) => !!this.getContext(id).active[from]

    get = (from, id) => {
        const context = this.getContext(id).active
        if (typeof from === 'object') {
            const symbol = from[specialKeys.root]?.symbol
            if (symbol) from = symbol
            else return false
        }

        return context[from]
    }
    



    // ----------------- Global Flow Activation Management -----------------
    update = (from, update, id) => {

    const context = this.#contexts[id]
    context.update(from, update)

    const active = this.get(from, id)

    const listenerGroups = [{
        info: active,
        name: from // TODO: Check that this is correct
    }]

    listenerGroups.forEach(group => {

        const info = group.info

        if (info) {

            if (info[listenerObject]) {

                this.#send(from, update, {
                    id,
                    value: info.value,
                    parent: context.active,
                    key: group.name,
                    subscription: info.subscription,
                    __value: true
                })

            } else if (typeof info === 'object') {

                for (let key in info) {
                    this.#send(from, update, {
                        id,
                        parent: info,
                        key,
                        subscription: info[key].subscription,
                        value: info[key].value,
                    })
                }
            } else console.error('Improperly Formatted Listener', info)
        }
    })
    
}

#send = (from, update, fullInfo) => {

    const isValue = fullInfo?.__value
    let parent = fullInfo.parent
    let to = fullInfo.key
    const id = fullInfo.id


    // const rootArr = root.split(keySeparator)
    const info = fullInfo.parent[to]

    let target = info.value

    let config = info?.[configKey] // Grab config

    let ogValue = target
    const type = typeof target

    const checkIfSetter = (path, willSet) => {

        const info = this.monitor.get(path, 'info')

        if (info.exists) {
            const val = info.value
            const noDefault = typeof val !== 'function' && !val?.default
            const value = (noDefault) ? toSet : val

            const res = { value, bound: info.parent } // Ensure you have access to the bound parent

            if (willSet) {
                target = res.value
                parent[to] = res
            }

            return res
        } else return { value: undefined } //, root: undefined }

    }

    const transform = (willSet?) => {
        const fullPath = [id]
        // if (root) fullPath.push(...rootArr) // correcting for relative string
        fullPath.push(...to.split(keySeparator))
        return checkIfSetter(fullPath, willSet)
    }

    // ------------------ Grab Correct Target to Listen To ------------------


    const getPathArray = (latest) => {
        const path = [id]
        const topPath: any[] = []
        // if (this.rootPath) topPath.push(...this.rootPath.split(keySeparator)) // correcting for relative string
        topPath.push(...latest.split(keySeparator))
        path.push(...topPath)
        return path
    }

    // Confirmation of the target
    if (typeof target === 'boolean') {
        if (!isValue) transform(true)
        else console.error(`Cannot use a boolean for ${specialKeys.listeners.value}...`)
    }

    // Name of the target
    else if (type === 'string') {
        const path = getPathArray(ogValue)
        checkIfSetter(path, true)

        if (isValue) {
            parent[to] = { [ogValue]: parent[to] }
            to = ogValue
        }
    }

    else if (target && type === 'object') {

        // Check if configuration object
        const isConfig = isConfigObject(ogValue)

        if (isConfig) {

            if ('value' in ogValue) {
                if (isValue) target = parent[to] = ogValue.value // setting value
                else target = parent[to].value = ogValue.value // setting value
            } else transform(true)

            if (ogValue) config = ogValue

            Object.defineProperty(parent[to], configKey, { value: config })
        }

    }

    // ------------------ Special Keywords ------------------
    let isValidInput = true

    if (config) {

        
        // const bindKey = specialKeys.listeners.bind
        // if (bindKey in config) {
        //     if (typeof config[bindKey] === 'string') {
        //         const path = getPathArray(config[bindKey])
        //         const res = this.monitor.get(path)
        //         if (!res)  target = `because ${path.slice(1).join(keySeparator)} does not point correctly to an existing component.`
        //         else {
        //             config[bindKey] = {
        //                 value: res,
        //                 original: config[bindKey]
        //             }
        //         }
        //     } else if (!config[bindKey].value.__parent) {
        //         target = `because ${config[bindKey].original ?? id.toString()} has become unparented.`
        //     }

        // } 
        
        // else {

            const branchKey = specialKeys.listeners.branch
            const formatKey = specialKeys.listeners.format

            if (branchKey in config) {

                const isValid = config[branchKey].find(o => {

                    let localValid: boolean[] = []
                    if ('if' in o) localValid.push(o.if(update)) // Condition Function
                    if ('is' in o) localValid.push(o.is === update) // Equality Check
                    const isValidLocal = localValid.length > 0 && localValid.reduce((a, b) => a && b, true)

                    if (isValidLocal) {
                        if ('value' in o)  update = o.value // set first argument to branch value
                    }

                    return isValidLocal
                })

                if (!isValid) isValidInput = false
            }


            
            // NOTE: May turn into an array here
            if (formatKey in config) {
                try {
                    update = config[formatKey](update)
                    if (update === undefined) isValidInput = false
                } catch (e) { console.error('Failed to format arguments', e) }
            }

        // }
    }


    // ------------------ Handle Target ------------------
    if (
        isValidInput // Ensure input is valid
        && update !== undefined // Ensure input is not exactly undefined (though null is fine)
    ) {

        const arrayUpdate = Array.isArray(update) ? update : [update]


        // Set New Value on Parent
        if (target === toSet) {
            const parentPath = [id]
            // if (root) parentPath.push(...rootArr) // TODO: Check if this needs fixing
            parentPath.push(...to.split(keySeparator))
            const idx = parentPath.pop()
            const info = this.monitor.get(parentPath, 'info')
            if (info.value) info.value[idx] = update
            else console.error(`Cannot set value on ${parentPath.filter(str => typeof str !== 'symbol').join(keySeparator)} from ${from}`)
        }

        // Direct Object with Default Function
        else if (target?.default) {
            target.default.call(target, ...arrayUpdate) // Call with parent context
        }

        // Direct Function
        else if (typeof target === 'function') {

            // const noContext = parent[to][listenerObject]
            // if (noContext) 
            // const isBound = config?.[specialKeys.listeners.bind]?.value
            // const boundTo = isBound ?? info.bound // TODO: Register these so they can be easily removed...

            if (info.bound) target.call(info.bound, ...arrayUpdate) // Call with top-level context
            else target(...arrayUpdate) // Call with default context
        }

        // Failed
        else {

            let baseMessage = (to) ? `listener: ${from} —> ${to}` : `listener from ${from}`
            if (parent) {
                console.warn(`Deleting ${baseMessage}`, target)
                delete parent[to]
            } else console.error(`Failed to add ${baseMessage}`, target)
        }
    }
}


}

export default Edgelord