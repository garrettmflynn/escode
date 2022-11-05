
import Monitor from "../../esmonitor/src";
import  { specialKeys, defaultPath } from "../../esc/standards"

const listenerObject = Symbol('listenerObject')
const toSet = Symbol('toSet')
const isConfigObject = (o) => specialKeys.listeners.format in o || specialKeys.listeners.branch in o || specialKeys.listeners.trigger in o || specialKeys.listeners.bind in o

const initializedStatus = 'INITIALIZED'
const registeredStatus = 'REGISTERED'

const globalFrom = {} as any
const globalTo = {} as any

const globalActive = {}

const subscriptionKey = Symbol('subscriptionKey')
const configKey = Symbol('configKey')
const toResolveWithKey = Symbol('toResolveWithKey')

class Edgelord {

    monitor: Monitor
    original = {};
    active = {}
    globals: any = {}
    context: any = {}
    rootPath: string = ''
    status = ''
    


    #triggers: any[] = []
    #queue: any[] = []
    #toResolveWith: Edgelord
    // #sendsToExternalGraph = false

    constructor (listeners = {}, root, context) {
        this.context = context
        this.rootPath = root
        this.original = listeners

        const globals = [{name: 'active', ref: globalActive}, {name: 'from', ref: globalFrom}, {name: 'to', ref: globalTo}]
        globals.forEach((o) => {
            if (!o.ref[this.context.id]) o.ref[this.context.id] = {}
            this.globals[o.name] = o.ref[this.context.id]
        })

        this.#toResolveWith = this.getManager()
        this.runEachListener(listeners, this.addToGlobalLog)
    }

    getManager = (mode ='from') => {
        
            // Check if a higher-level listener is sending information from this root context
            let target = (mode === 'to') ? this.globals.to : this.globals.from
            this.rootPath.split(this.context.options.keySeparator).forEach((key) => {
                if (!target[key]) target[key] = {}
                target = target[key]
            })

            // if (Object.keys(target).length) this.#sendsToExternalGraph = true
            return target[toResolveWithKey] ?? this
    }

    onStart = (f) => {
        const res = this.#toResolveWith
        const isSame = res === this
        if (isSame) {
            if (this.status === initializedStatus) f()
            else this.#queue.push(f)
        } else res.onStart(f)
    }

    runEachListener = (listeners, callback) => {
        if (!callback) return
        for (let toPath in listeners) {
            const from = listeners[toPath]

            if (!from) {
                console.warn('Skipping empty listener:', toPath)
                continue;
            }

            if (from && typeof from === 'object') {
                for (let fromPath in from) callback(fromPath, toPath, from[fromPath])
            } 
            
            // Immediate Absolute Paths Only
            else {
                if (typeof toPath === 'string') callback(from, toPath, toPath)
                else console.error('Improperly Formatted Listener', toPath)
            }
        }

    }

    register = (listeners = this.original) =>  {

        this.runEachListener(listeners, this.add)
        this.status = registeredStatus
    }

    #initialize = (o) => {
        const res = this.context.monitor.get(o.path, 'info')
        if (typeof res.value === 'function') {
            const args = (Array.isArray(o.args)) ? o.args : [o.args]
            res.value(...args)
        }
        else console.error('Cannot yet trigger values...', o)
    }

    initialize = (o?) => {
        if (!this.status) this.#triggers.push(o)
        else if (this.status === registeredStatus) {
            this.status = initializedStatus
            this.#triggers.forEach(this.#initialize)
            this.#queue.forEach(f => f())
            this.#queue = []
            this.#triggers = []
        } else this.#initialize(o)
    }

    start = () => {
        this.register()
        this.initialize()
    }

    #getAbsolutePath = (name) => {
        return (!name || !this.rootPath || name.includes(this.rootPath)) ? name : [this.rootPath, name].join(this.context.monitor.options.keySeparator)
    }

    #getPathInfo = (path) => {

        const output = {
            absolute: {},
            relative: {}
        } as any

        // Transform name to absolute 
        path =  this.#getAbsolutePath(path)
        let rel = this.rootPath ? path.replace(`${this.rootPath}.`, '') : path
        const baseArr = path.split(this.context.options.keySeparator)
        output.absolute.array = [this.context.id, ...baseArr]
        output.relative.array = rel.split(this.context.options.keySeparator)
        const obj = this.context.monitor.get(output.relative.array, undefined, this.context.instance) // Allow for getting properties
        const isComponent = obj?.hasOwnProperty(specialKeys.path)

        // Updates based on default
        if (isComponent) {
            output.absolute.array.push(defaultPath)
            output.relative.array.push(defaultPath)
        }

        output.absolute.value = output.absolute.array.slice(1).join(this.context.options.keySeparator) // update path
        output.relative.value = output.relative.array.join(this.context.options.keySeparator) // update path
        
        return output
    }

    add = (from, to, value: any = true, subscription) => {


        const fromInfo = this.#getPathInfo(from)
        const toInfo = this.#getPathInfo(to)

        // Check global for subscription
        const absPath = fromInfo.absolute.value
        if (!subscription) subscription = this.globals.active[absPath]?.[subscriptionKey]

        // Only subscribe once
        if (!subscription) {
            subscription = this.context.monitor.on(fromInfo.absolute.array, (path, _, update) => this.activate(path, update), {
                ref: this.context.instance,
                path: fromInfo.relative.array
            })
        }

        const info = {
            value,
            [listenerObject]: true
        }

        const refs = [this.active, this.globals.active]

        refs.forEach(ref => {
            if(!ref[absPath]) ref[absPath] = {}
            const base = ref[absPath]
            if (!base[subscriptionKey]) {
                Object.defineProperty(base, subscriptionKey, {
                    value: subscription,
                    configurable: true
                })
            }
            base[toInfo.absolute.value] = info
        })

        // // Update Original
        // let base = this.original[toInfo.relative.value]
        // if (!base) base = this.original[toInfo.relative.value] = {}
        // if (typeof base !== 'object') {
        //     if (typeof base === 'function') base = this.original[toInfo.relative.value] = {[Symbol('function listener')]: base} // Move function to arbitrary key
        //     else base = this.original[toInfo.relative.value] = {[base]: true} // Move string to  a complex listener
        // }
        // base[fromInfo.relative.value] = value // complex listener

        // Initalize triggers (possible on higherl-level manager)
        const args = value[specialKeys.listeners.trigger]
        if (args) this.#toResolveWith.initialize({
            path: fromInfo.absolute.array,
            args
        })

        this.addToGlobalLog(absPath)


        return info
    }

    addToGlobalLog = (path, mode = 'from') => {

        const absolutePath = this.#getAbsolutePath(path)

        // Register in global registry
        let target = (mode === 'to') ? this.globals.to : this.globals.from
        const globalPath = absolutePath.split(this.context.options.keySeparator)
        globalPath.forEach((key) => {
            if (!target[key]) target[key] = {}
            target = target[key]
            if (!(target[toResolveWithKey])) target[toResolveWithKey] = this // Always set with the lowest
        })

    }

    // Local removal
    remove = (from, to) => {
        const fromInfo = this.#getPathInfo(from)
        const toInfo = this.#getPathInfo(to)

        const path = [fromInfo.absolute.value, toInfo.absolute.value]
        const toRemove = [
            { ref: this.active, path },
            { ref: this.globals.active, path, unlisten: true }, // Remove subscription if required
            // { ref: this.original, path: [toInfo.relative.value, fromInfo.relative.value] }, // Just removing from the list
        ]

        toRemove.forEach(o => {
            const { ref, path, unlisten } = o

            let base = ref[path[0]]

            if (typeof base === 'object') {
                delete base[path[1]] // complex listener
                if (Object.keys(base).length === 0) {
                    delete ref[path[0]]
                    const sub = base[subscriptionKey]
                    if (unlisten && sub) {
                        this.context.monitor.remove(sub) // Cleaning up subscriptions (active only)
                    }
                    delete base[subscriptionKey]
                }

            } else delete ref[path[0]] // simple listener

        })

    }

    // Local clearing
    clear = (name) => {
        const value = this.#getAbsolutePath(name)

        Object.keys(this.active).forEach(from => {
            Object.keys(this.active[from]).forEach(to => {
                if (
                    !value
                    || from.slice(0, value.length) === value // Matches from
                    || to.slice(0, value.length) === value // Matches to
                ) this.remove(from, to)
            })
        })
    }

    has = (from, ref=this.active) => !!ref[from]

    get = (from, ref=this.active) => ref[from]



    // ----------------- Global Flow Activation Management -----------------
    activate = (from, update) => {

    const listenerGroups = [{
        info: this.get(from, this.globals.active),
        name
    }]

    listenerGroups.forEach(group => {

        const info = group.info

        if (info) {

            if (info[listenerObject]) {
                this.pass(from, {
                    value: info.value,
                    parent: this.active,
                    key: group.name,
                    subscription: info.subscription,
                    __value: true
                }, update)
            } else if (typeof info === 'object') {
                for (let key in info) {
                    this.pass(from, {
                        parent: info,
                        key,
                        subscription: info[key].subscription,
                        value: info[key].value,
                    }, update)
                }
            } else console.error('Improperly Formatted Listener', info)
        }
    })
}

pass = (from, target, update) => {

    const id = this.context.id

    let parent, key, subscription
    const isValue = target?.__value
    parent = target.parent
    key = target.key

    subscription = target.subscription

    // const rootArr = root.split(this.context.options.keySeparator)
    const info = target.parent[key]
    target = info.value

    let config = info?.[configKey] // Grab config

    let ogValue = target
    const type = typeof target

    const checkIfSetter = (path, willSet) => {

        const info = this.context.monitor.get(path, 'info')
        if (info.exists) {
            const val = info.value
            const noDefault = typeof val !== 'function' && !val?.default
            const value = (noDefault) ? toSet : val

            const res = { value }

            if (willSet) {
                target = res.value
                parent[key] = res
            }

            return res
        } else return { value: undefined } //, root: undefined }

    }

    const transform = (willSet?) => {
        const fullPath = [id]
        // if (root) fullPath.push(...rootArr) // correcting for relative string
        fullPath.push(...key.split(this.context.options.keySeparator))
        return checkIfSetter(fullPath, willSet)
    }

    // ------------------ Grab Correct Target to Listen To ------------------


    const getPathArray = (latest) => {
        const path = [id]
        const topPath: any[] = []
        if (this.rootPath) topPath.push(...this.rootPath.split(this.context.options.keySeparator)) // correcting for relative string
        topPath.push(...latest.split(this.context.options.keySeparator))
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
            parent[key] = { [ogValue]: parent[key] }
            key = ogValue
        }
    }

    else if (target && type === 'object') {

        // Check if configuration object
        const isConfig = isConfigObject(ogValue)

        if (isConfig) {

            if ('value' in ogValue) {
                if (isValue) {
                    target = parent[key] = ogValue.value // setting value
                } else {
                    target = parent[key].value = ogValue.value // setting value
                }
            } else transform(true)

            if (ogValue){
                if (ogValue) config = ogValue
            }

            Object.defineProperty(parent[key], configKey, { value: config })
        }

    }

    // ------------------ Special Keywords ------------------
    let isValidInput = true

    if (config) {

        
        const bindKey = specialKeys.listeners.value
        if (bindKey in config) {

            // (de)Register listeners at runtime...
            const path = getPathArray(config[bindKey].original ?? config[bindKey])
            if (typeof config[bindKey] === 'string') {
                const res = this.context.monitor.get(path)
                if (!res)  target = `because ${path.slice(1).join(this.context.options.keySeparator)} does not point correctly to an existing component.`
                else {
                    config[bindKey] = {
                        value: res,
                        original: config[bindKey]
                    }
                }
            } else if (!config[bindKey].value.esParent) {
                target = `because ${config[bindKey].original ?? id.toString()} has become unparented.`
            }

        } 
        
        else {

            const branchKey = specialKeys.listeners.branch
            const formatKey = specialKeys.listeners.format

            if (branchKey in config) {

                const isValid = config[branchKey].find(o => {

                    let localValid: boolean[] = []
                    if ('condition' in o) localValid.push(o.condition(update)) // Condition Function
                    if ('equals' in o) localValid.push(o.equals === update) // Equality Check
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

        }
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
            parentPath.push(...key.split(this.context.options.keySeparator))
            const idx = parentPath.pop()
            const info = this.context.monitor.get(parentPath, 'info')
            info.value[idx] = update
        }

        // Direct Object with Default Function
        else if (target?.default) target.default.call(target, ...arrayUpdate) // Call with parent context

        // Direct Function
        else if (typeof target === 'function') {
            const noContext = parent[key][listenerObject]
            if (noContext) target.call(config?.[specialKeys.listeners.bind]?.value ?? this.context.instance, ...arrayUpdate) // Call with top-level context
            else target(...arrayUpdate) // Call with default context
        }

        // Failed
        else {

            let baseMessage = (key) ? `listener: ${from} —> ${key}` : `listener from ${from}`
            if (parent) {
                console.warn(`Deleting ${baseMessage}`, target)
                delete parent[key]
            } else console.error(`Failed to add ${baseMessage}`, target)
        }
    }
}


}

export default Edgelord