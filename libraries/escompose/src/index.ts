import Monitor from "../../esmonitor/src"
import createComponent from "./create"
import * as clone from "../../common/clone.js"
import * as standards from "../../common/standards"
import { Options } from "../../common/types"
import { ESComponent } from "./component"


const listenerObject = Symbol('listenerObject')

// TODO: Ensure that this doesn't have a circular reference
const drill = (o, id: string | symbol, parent?, path: any[] = [], opts?) => {

    // ------------------ Merge ESM with esCompose Properties ------------------
    const clonedEsCompose = clone.deep(o.esCompose) ?? {}
    // let merged = merge(Object.assign({}, clonedEsCompose), o)
    let merged = Object.assign({}, Object.assign(Object.assign({}, clonedEsCompose), o))

    delete merged.esCompose

    // ------------------ Create Instance with Special Keys ------------------
    const instance = createComponent(id, merged, parent)
    const savePath = path.join(opts.keySeparator ?? standards.keySeparator)
    if (opts?.components) opts.components[savePath] = {instance, depth: (parent) ? path.length + 1 : path.length}

    // ------------------ Convert Nested Components ------------------
    if (instance.esComponents) {
        for (let name in instance.esComponents) {
            const base = instance.esComponents[name]
            let thisPath = [...path, name]
            const thisInstance = drill(base, name, instance, thisPath, opts) // converting from top to bottom
            instance.esComponents[name] = thisInstance // replace in config
        }
    }

    return instance
}

const setListeners = (context, components) => {

    context.listeners = {}
    for (let root in components) {
        const info = components[root]
        const listeners = info.instance.esListeners
        for (let path in listeners) {

            const basePath = [context.id]
            const topPath: string[] = []
            if (root) topPath.push(...root.split(context.options.keySeparator))
            if (path) topPath.push(...path.split(context.options.keySeparator))
            basePath.push(...topPath)


            const obj = context.monitor.get(basePath)
            if (obj?.__isESComponent) basePath.push(standards.defaultPath)

            // Collect All Listeners
            const joined = topPath.join(context.options.keySeparator)
            if (!context.listeners[joined]) context.listeners[joined] = {}

            const value = listeners[path]
            if (typeof value === 'object') {
                for (let key in value) context.listeners[joined][key] = { value, root, [listenerObject]: true }
            } else context.listeners[joined] = { value, root, [listenerObject]: true }
            

            context.monitor.on(basePath, (path, _, args) => {
                passToListeners(context, path, args)
            })
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
    target = target.parent[key].value

    let ogValue = target
    const type = typeof target

    const checkIfSetter = (path) => {
        const info = context.monitor.get(path, 'info')
        if (info.exists) {
            const val = info.value
            const noDefault = typeof val !== 'function' && !val?.default
            if (noDefault) target = toSet
            else target = val

            parent[key] = {
                value: target,
                root // carry over the root
            }
        }
    }

    // ------------------ Grab Correct Target to Listen To ------------------
    if (typeof target === 'boolean') {
        if (!isValue) {
            const fullPath = [id]
            if (root) fullPath.push(...rootArr) // correcting for relative string
            fullPath.push(...key.split(context.options.keySeparator))
            checkIfSetter(fullPath)
        } else console.error('Cannot use a boolean for esListener...')
    } else if (type === 'string') {
        const path = [id]
        const topPath: any[] = []
        if (root) topPath.push(...rootArr) // correcting for relative string
        topPath.push(...ogValue.split(context.options.keySeparator))
        path.push(...topPath)
        checkIfSetter(path)

        const absPath = topPath.join(context.options.keySeparator)
        if (isValue) {
            parent[key] = {[absPath]: parent[key]}
            key = absPath
        }
    }

    // ------------------ Handle Target ------------------

    // Set New Value on Parent
    if (target === toSet)  {
        const parentPath = [id]
        // if (root) parentPath.push(root) // TODO: Check if this needs fixing
        parentPath.push(...key.split(context.options.keySeparator))
        const idx = parentPath.pop()
        const info = context.monitor.get(parentPath, 'info')
        info.value[idx] = args[0]
    }
    
    // Direct Object with Default Function
    else if (target?.default) target.default(...args)

    // Direct Function
    else if (typeof target === 'function') target(...args)

    else {
        try {
            const parentPath = [id]
            if (root) parentPath.push(...rootArr)
            parentPath.push(...key.split(context.options.keySeparator))
            const idx = parentPath.pop()
            const info = context.monitor.get(parentPath, 'info')
            const arg = args[0]
            if (target.esBranch) {
                target.esBranch.forEach(o => {
                    if (o.equals === arg) info.value[idx] = o.value
                })
            } else info.value[idx] = target // Setting with provided value
        } catch (e) {
            let baseMessage = `listener: ${from} —> ${key}`
            if (parent) {
                console.error(`Deleting ${baseMessage}`, parent[key], e)
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
        if (info){

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
        if (!options.monitor) options.monitor  = {}
        if (!options.monitor.keySeparator) {
            if (!options.keySeparator) options.keySeparator = standards.keySeparator // Ensure key separator is defined
            options.monitor.keySeparator = options.keySeparator
        }
        monitor = new Monitor(options.monitor)
    }

    // Always fall back to esComponents
    monitor.options.fallbacks = ['esComponents']

    const fullOptions = options as Options


    const id = Symbol('root')
    const components = {}
    const instance = drill(config, id, undefined, undefined, {
        components,
        keySeparator: fullOptions.keySeparator
    })
    
    let fullInstance = instance// clone.deep(instance)

    monitor.set(id, fullInstance, fullOptions.listeners) // Setting root instance

    const context = {
        id, 
        instance: 
        fullInstance, 
        monitor, 
        options: fullOptions
    }

    setListeners(context, components)

    fullInstance.esInit()

    return fullInstance as ESComponent
}

export default create