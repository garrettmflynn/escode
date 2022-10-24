import Monitor from "../../esmonitor/src"
import createComponent from "./create"
import * as clone from "../../common/clone.js"
import * as standards from "../../common/standards"
import { Options } from "../../common/types"
import { ESComponent } from "./component"
import { merge } from "./utils"


const listenerObject = Symbol('listenerObject')

// TODO: Ensure that this doesn't have a circular reference
const drill = (o, id: string | symbol, parent?, path: any[] = [], opts?) => {

    // ------------------ Merge ESM with esCompose Properties ------------------
    let clonedEsCompose = clone.deep(o.esCompose) ?? {}

    // Merge Traversal (i.e. only unset if undefined, otherwise drill into objects)
    let merged = Object.assign({}, o) // basic clone
    if (!Array.isArray(clonedEsCompose)) clonedEsCompose = [clonedEsCompose]
    clonedEsCompose.reverse().forEach((toCompose) => merged = merge(Object.assign({}, toCompose), merged)) // Apply the first one last

    // Simple Merge
    // let merged = Object.assign({}, Object.assign(Object.assign({}, clonedEsCompose), o))

    delete merged.esCompose

    // ------------------ Create Instance with Special Keys ------------------
    const instance = createComponent(id, merged, parent)
    const savePath = path.join(opts.keySeparator ?? standards.keySeparator)
    if (opts?.components) opts.components[savePath] = { instance, depth: (parent) ? path.length + 1 : path.length }

    // ------------------ Convert Nested Components ------------------
    if (instance.esDOM) {
        for (let name in instance.esDOM) {
            const base = instance.esDOM[name]
            let thisPath = [...path, name]
            const thisInstance = drill(base, name, instance, thisPath, opts) // converting from top to bottom
            instance.esDOM[name] = thisInstance // replace in config
        }
    }

    return instance
}


const handleListenerValue = ({
    context,
    root,
    fromPath,
    toPath,
    config,
    listeners
}) => {
    
     // Getting Listener Path
     const fromSubscriptionPath = [context.id]
     const topPath: string[] = []
     if (root) topPath.push(...root.split(context.options.keySeparator))
     if (fromPath) topPath.push(...fromPath.split(context.options.keySeparator))
     fromSubscriptionPath.push(...topPath)
     const obj = context.monitor.get(fromSubscriptionPath)
     if (obj?.__isESComponent) fromSubscriptionPath.push(standards.defaultPath)

     // Getting Source Path (keep from —> to syntax)
     // and handling configuration object (TODO: Move out to ESMonitor)
     const value = config // Subscription configuration object
     const fromStringPath = topPath.join(context.options.keySeparator)

     if (!listeners[fromStringPath]) {
        listeners[fromStringPath] = {}
        context.monitor.on(fromSubscriptionPath, (path, _, args) => passToListeners(context, path, args)) // only subscribe once
     }

     listeners[fromStringPath][toPath] = { value, root, [listenerObject]: true }
}

const setListeners = (context, components) => {

    const listeners = context.listeners = {} // Uses from —> to syntax

    for (let root in components) {
        const info = components[root]
        const to = info.instance.esListeners  // Uses to —> from syntax
        for (let toPath in to) {
            const from = to[toPath]

            const mainInfo = {
                context,
                root,
                toPath,
                listeners
            }

            if (from && typeof from === 'object') {
                for (let fromPath in from)  handleListenerValue({...mainInfo, fromPath, config: from[fromPath]})
            } 
            
            // Immediate Absolute Paths Only
            else {
                if (typeof toPath === 'string') handleListenerValue({...mainInfo, fromPath: from, config: toPath})
                else console.error('Improperly Formatted Listener', to)
            }
        }
    }
}


function pass(from, target, args, context) {

    const id = context.id

    let parent, key, root
    const isValue = target?.__value
    parent = target.parent
    key = target.key
    root = target.root
    const rootArr = root.split(context.options.keySeparator)
    const info = target.parent[key]
    target = info.value

    let config = info?.esConfig // Grab config

    let ogValue = target
    const type = typeof target

    const checkIfSetter = (path, willSet) => {
        const info = context.monitor.get(path, 'info')
        if (info.exists) {
            const val = info.value
            const noDefault = typeof val !== 'function' && !val?.default
            const value = (noDefault) ? toSet : val

            const res = {
                value,
                root // carry over the root
            }

            if (willSet) {
                target = res.value
                parent[key] = res
            }

            return res
        } else return { value: undefined, root: undefined }

    }

    const transform = (willSet?) => {
        const fullPath = [id]
        if (root) fullPath.push(...rootArr) // correcting for relative string
        fullPath.push(...key.split(context.options.keySeparator))
        return checkIfSetter(fullPath, willSet)
    }

    // ------------------ Grab Correct Target to Listen To ------------------

    // Confirmation of the target
    if (typeof target === 'boolean') {
        if (!isValue) transform(true)
        else console.error('Cannot use a boolean for esListener...')
    }

    // Name of the target
    else if (type === 'string') {
        const path = [id]
        const topPath: any[] = []
        if (root) topPath.push(...rootArr) // correcting for relative string
        topPath.push(...ogValue.split(context.options.keySeparator))
        path.push(...topPath)
        checkIfSetter(path, true)

        if (isValue) {
            parent[key] = { [ogValue]: parent[key] }
            key = ogValue
        }
    }

    // Configuration Object
    else if (target && type === 'object' && !target.hasOwnProperty('__isESComponent')) {
        transform(true)
        Object.defineProperty(parent[key], 'esConfig', { value: ogValue })
        config = ogValue
    }


    // ------------------ Special Keywords ------------------
    let isValidInput = true

    if (config) {
        if (config.hasOwnProperty('esFormat')) {
            try {
                args = config.esFormat(...args)
                if (args === undefined) isValidInput = false
                if (!Array.isArray(args)) args = [args]
            } catch (e) { console.error('Failed to format arguments', e) }
        }

        if (config.hasOwnProperty('esBranch')) {
            let isValid = false

            config.esBranch.forEach(o => {
                if (o.equals === args[0]) {
                    args[0] = o.value // set first argument to branch value
                    isValid = true
                }
            })

            if (!isValid) isValidInput = false
        }
    }

    // ------------------ Handle Target ------------------
    if (isValidInput) {
        // Set New Value on Parent
        if (target === toSet) {
            const parentPath = [id]
            if (root) parentPath.push(...rootArr) // TODO: Check if this needs fixing
            parentPath.push(...key.split(context.options.keySeparator))
            const idx = parentPath.pop()
            const info = context.monitor.get(parentPath, 'info')
            info.value[idx] = args[0]
        }

        // Direct Object with Default Function
        else if (target?.default) target.default(...args)

        // Direct Function
        else if (typeof target === 'function') target(...args)

        // Failed
        else {

            let baseMessage = `listener: ${from} —> ${key}`
            if (parent) {
                console.error(`Deleting ${baseMessage}`, parent[key])
                delete parent[key]
            } else console.error(`Failed to add ${baseMessage}`, target)
        }
    }
}

function passToListeners(context, name, ...args) {

    const sep = context.options.keySeparator
    const noDefault = name.slice(0, -`${sep}${standards.defaultPath}`.length)
    const listenerGroups = [{
        info: context.listeners[name],
        name
    }, {
        info: context.listeners[noDefault],
        name: noDefault
    }]

    listenerGroups.forEach(group => {

        const info = group.info
        if (info) {

            if (info[listenerObject]) {
                pass(name, {
                    value: info.value,
                    parent: context.listeners,
                    key: group.name,
                    root: info.root,
                    __value: true
                }, args, context)
            } else if (typeof info === 'object') {
                for (let key in info) {
                    pass(name, {
                        parent: info,
                        key,
                        root: info[key].root,
                        value: info[key].value,
                    }, args, context)
                }
            } else console.error('Improperly Formatted Listener', info)
        }
    })
}



const toSet = Symbol('toSet')
const create = (config, options: Partial<Options> = {}) => {

    // config = clone.deep(config) // Start with a deep copy

    // -------------- Create Complete Options Object --------------

    let monitor;
    if (options.monitor instanceof Monitor) {
        monitor = options.monitor
        options.keySeparator = monitor.options.keySeparator // Inherit key separator
    } else {
        if (!options.monitor) options.monitor = {}
        if (!options.monitor.keySeparator) {
            if (!options.keySeparator) options.keySeparator = standards.keySeparator // Ensure key separator is defined
            options.monitor.keySeparator = options.keySeparator
        }
        monitor = new Monitor(options.monitor)
    }

    // Always fall back to esDOM
    monitor.options.fallbacks = ['esDOM']

    const fullOptions = options as Options


    const id = Symbol('root')
    const components = {}
    const instance = drill(config, id, undefined, undefined, {
        components,
        keySeparator: fullOptions.keySeparator
    })

    let fullInstance = instance // clone.deep(instance)

    monitor.set(id, fullInstance, fullOptions.listeners) // Setting root instance

    const context = {
        id,
        instance: fullInstance,
        monitor,
        options: fullOptions
    }

    setListeners(context, components)

    fullInstance.esInit()

    return fullInstance as ESComponent
}

export default create