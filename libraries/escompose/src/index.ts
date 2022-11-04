import Monitor from "../../esmonitor/src"
import createComponent from "./create"
import * as cloneUtils from "../../common/clone.js"
import * as standards from "../../common/standards"
import { Options } from "../../common/types"
import { ESComponent } from "./component"
import * as utils from "./utils"


const listenerObject = Symbol('listenerObject')

type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]

const createErrorComponent = (message) => {
    return {
        esElement: 'p',
        esDOM: {
            b: {
                esElement: 'b',
                esAttributes: {
                    innerText: 'Error: '
                }
            },
            span: {
                esElement: 'span',
                esAttributes: {
                    innerText: message
                }
            }
        }
    }
}


const esCompile = (o, opts: any = {}) => {
            
        // Special URL key
        let uri = (typeof o === 'string') ? o : o.esURI

        if (uri && opts.utilities) {

            return new Promise(async (resolve) => {

                try {

                    // Get Text Bundle
                    const bundleOpts = opts.utilities.bundle
                    const compileOpts = opts.utilities.compile

                    if (typeof bundleOpts.function === 'function') {
                        const options = bundleOpts.options ?? {}
                        if (!options.bundler) options.bundler = 'datauri' // link as datauri
                        if (!options.bundle) options.collection ='global' // same collection across all instances on the page
                        const bundle = bundleOpts.function(uri, options)

                        // Track Bundle Resolution
                        await bundle.resolve()
                        o = Object.assign({}, bundle.result)

                        console.log('Got From Bundle', o, uri)
                    } 
                    
                    // Just Compile
                    else if (typeof compileOpts.function === 'function') {
                        const resolved = await compileOpts.function(o, compileOpts.options)
                        o = resolved
                    } 
                    
                    // Show Error Message
                    else {
                        throw new Error('Cannot transform esCompose string without a compose utility function')
                    }
                } catch (e) {        
                    // Insert an Error Component
                    if (o.esReference) {
                        console.warn('[escompose]: Falling back to ES Component reference...', e)
                        o = o.esReference // fallback to reference key
                    }
                    else o = createErrorComponent(e.message)
                }

                resolve(cloneUtils.deep(o))
            })
        }

        return cloneUtils.deep(o) 
}

const esMerge = (base, esCompose: esComposeType = {}, path: any[] = [], opts: any = {}) => {

    // Ensure esCompose is an array
    if (!Array.isArray(esCompose)) esCompose = [esCompose]

    // Merge nested esCompose objects
    let promise = utils.resolve(esCompose.map(o => {
       const compiled = esCompile(o, opts) // Resolve from text if required
       return utils.resolve(compiled, (compiled) => {

            let arr: any[] = [compiled]
            let target = compiled
            while (target.esCompose) {
                const val = target.esCompose
                delete target.esCompose
                target = utils.resolve(esCompile(val, opts)) // Resolve from text if required

                arr.push(target)
            }

            return arr
        })
    }))

    return utils.resolve(promise, (clonedEsCompose) => {

        const flat = clonedEsCompose.flat();
        let merged = Object.assign({}, base);
        delete merged.esCompose;
        flat.forEach((toCompose) => {
            merged = utils.merge(toCompose, merged, path);
        });

        return merged;

    })
}

// TODO: Ensure that this doesn't have a circular reference
const esDrill = (o, id: string | symbol, toMerge = {}, parent?, opts?) => {

    const parentId = parent?.__isESComponent
    const path = (parentId) ? [parentId, id] : ((typeof id === 'string') ? [id] : [])

    // TODO: Search the entire object for the esCompose key. Then execute this merge script
    // ------------------ Merge ESM with esCompose Properties ------------------
    const firstMerge = utils.merge(toMerge, o, path);
    const merged = esMerge(firstMerge, o.esCompose, path, opts)

    const res = utils.resolve(merged, (merged) => {

        delete merged.esCompose

        // ------------------ Create Instance with Special Keys ------------------
        const instance = createComponent(id, merged, parent, opts)
        const savePath = path.join(opts.keySeparator ?? standards.keySeparator)
        if (opts?.components) opts.components[savePath] = { instance, depth: (parent) ? path.length + 1 : path.length }

        // ------------------ Convert Nested Components ------------------
        if (instance.esDOM) {

            let positions = new Set()
            let position = 0;
            for (let name in instance.esDOM) {
                const base = instance.esDOM[name];

                const pos = base.esChildPosition
                if (pos !== undefined) {
                    if (positions.has(pos)) console.warn(`[escompose]: Duplicate esChildPosition value of ${pos} found in ${name} of ${instance.__isESComponent}`)
                    else positions.add(pos)
                }
                else {
                    while (positions.has(position)) position++ // find next available position
                    base.esChildPosition = position; // specify child position
                    positions.add(position)
                }

                const promise = esDrill(base, name, undefined, instance, opts); // converting from top to bottom
                
                instance.esDOM[name] = promise;


                resolve(promise, (res) => {
                    instance.esDOM[name] = res; // replace the promise with the converted component
                })
            }
        }

        return instance
    })

    return res

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
     if (obj?.hasOwnProperty('__isESComponent')) fromSubscriptionPath.push(standards.defaultPath)

     // Getting Source Path (keep from —> to syntax)
     // and handling configuration object (TODO: Move out to ESMonitor)
     const value = config // Subscription configuration object
     const fromStringPath = topPath.join(context.options.keySeparator)

      // Only subscribe once
     const sub = (!listeners.has(fromStringPath)) ? context.monitor.on(fromSubscriptionPath, (path, _, update) => {
        return passToListeners(context, listeners, path, update)
     }): undefined

     listeners.add(fromStringPath, toPath, { value, root }, sub)

     return {
        path: fromSubscriptionPath,
        config
     }
}


// This class references the original object when checking if listeners exist

// let notified = {}
class ListenerManager {

    monitor: Monitor
    original = {};
    active = {}
    rootPath: string

    constructor (monitor, listeners = {}, rootPath = '') {
        this.monitor = monitor
        this.rootPath = rootPath
        this.register(listeners)
    }

    register = (listeners) =>  {
        this.original = listeners
        Object.defineProperty(listeners, '__manager', {
            value: this,
            enumerable: false,
            writable: true // NOTE: This is being redefined if you create more than one object with the same input
        })
    }

    add = (from, to, value: any = true, subscription: any = this.active[from].sub) => {

        let root = ''
        if (value?.hasOwnProperty('root')) root = value.root
        if (value?.hasOwnProperty('value')) value = value.value
        else console.error('No root provided for new edge...')

        if(!this.active[from]) this.active[from] = {}

        this.active[from][to] = {
            value,
            root,
            subscription,
            [listenerObject]: true
        }

        // Update Original
        let base = this.original[to]
        if (!base) base = this.original[to] = {}
        if (typeof base !== 'object') {
            if (typeof base === 'function') base = this.original[to] = {[Symbol('function listener')]: base} // Move function to arbitrary key
            else base = this.original[to] = {[base]: true} // Move string to  a complex listener
        }

        base[from] = value // complex listener
    }

    remove = (from, to) => {
        const toRemove = [
            { ref: this.active, path: [from, to], unlisten: true },
            { ref: this.original, path: [to, from] }
        ]

        toRemove.forEach(o => {
            const { ref, path, unlisten } = o
            let base = ref[path[0]]

            if (typeof base === 'object') {
                const info = base[path[1]]
                delete base[path[1]] // complex listener
                if (Object.keys(base).length === 0) {
                    delete ref[path[0]]
                    if (unlisten && info.subscription) this.monitor.remove(info.subscription) // Cleaning up subscriptions (active only)
                }

            } else delete ref[path[0]] // simple listener

        })

    }

    clear = (name) => {

        const toCheck = (!name || !this.rootPath) ? name : [this.rootPath, name].join(this.monitor.options.keySeparator)
        Object.keys(this.active).forEach(from => {
            Object.keys(this.active[from]).forEach(to => {
                if (
                    !toCheck 
                    || from.slice(0, toCheck.length) === toCheck // Matches from
                    || to.slice(0, toCheck.length) === toCheck // Matches to
                ) this.remove(from, to)
            })
        })
    }

    has = (from) => !!this.active[from]

    get = (from) => this.active[from]

}


const setListeners = (context, components) => {

    // const listeners = new ListenerManager() // Uses from —> to syntax

    let toRun: any[] = []

    for (let root in components) {
        const info = components[root]
        const to = info.instance.esListeners ?? {}  // Uses to —> from syntax | Always set
        const listeners = new ListenerManager(context.monitor, to, root) // Uses from —> to syntax
        info.instance.esListeners = to // Replace with listeners assigned (in case of unassigned)

        for (let toPath in to) {
            const from = to[toPath]

            const mainInfo = {
                context,
                root,
                toPath,
                listeners
            }


            if (from && typeof from === 'object') {
                for (let fromPath in from) {
                    const config = from[fromPath]
                    const info = handleListenerValue({...mainInfo, fromPath, config})
                    if (info.config.esTrigger) toRun.push(info)
                }
            } 
            
            // Immediate Absolute Paths Only
            else {
                if (typeof toPath === 'string') handleListenerValue({...mainInfo, fromPath: from, config: toPath})
                else console.error('Improperly Formatted Listener', to)
            }
        }
    }

   return toRun // Trigger after all listeners are set
}


const isConfigObject = (o) => 'esFormat' in o || 'esBranch' in o || 'esTrigger' in o || 'esBind' in o

function pass(from, target, update, context) {

    const id = context.id

    let parent, key, root, subscription
    const isValue = target?.__value
    parent = target.parent
    key = target.key
    root = target.root

    subscription = target.subscription

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
                root, // carry over the root
                subscription // carry over the subscription
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


    const getPathArray = (latest) => {
        const path = [id]
        const topPath: any[] = []
        if (root) topPath.push(...rootArr) // correcting for relative string
        topPath.push(...latest.split(context.options.keySeparator))
        path.push(...topPath)
        return path
    }

    // Confirmation of the target
    if (typeof target === 'boolean') {
        if (!isValue) transform(true)
        else console.error('Cannot use a boolean for esListener...')
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

            Object.defineProperty(parent[key], 'esConfig', { value: config })
        }

    }

    // ------------------ Special Keywords ------------------
    let isValidInput = true

    if (config) {

        
        if ('esBind' in config) {

            // (de)Register listeners at runtime...
            const path = getPathArray(config.esBind.original ?? config.esBind)
            if (typeof config.esBind === 'string') {
                const res = context.monitor.get(path)
                if (!res)  target = `because ${path.slice(1).join(context.options.keySeparator)} does not point correctly to an existing component.`
                else {
                    config.esBind = {
                        value: res,
                        original: config.esBind
                    }
                }
            } else if (!config.esBind.value.esParent) {
                target = `because ${config.esBind.original ?? id.toString()} has become unparented.`
            }

        } 
        
        else {

            if ('esBranch' in config) {

                const isValid = config.esBranch.find(o => {

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
            if ('esFormat' in config) {
                try {
                    update = config.esFormat(update)
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
            if (root) parentPath.push(...rootArr) // TODO: Check if this needs fixing
            parentPath.push(...key.split(context.options.keySeparator))
            const idx = parentPath.pop()
            const info = context.monitor.get(parentPath, 'info')
            info.value[idx] = update
        }

        // Direct Object with Default Function
        else if (target?.default) target.default.call(target, ...arrayUpdate) // Call with parent context

        // Direct Function
        else if (typeof target === 'function') {
            const noContext = parent[key][listenerObject]
            if (noContext) target.call(config?.esBind?.value ?? context.instance, ...arrayUpdate) // Call with top-level context
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

function passToListeners(context, listeners, name, update) {

    const sep = context.options.keySeparator

    // Don;t use default
    const check = `${sep}${standards.defaultPath}`
    const noDefault = (name.slice(-check.length) === check) ? name.slice(0, -check.length) : name
    const listenerGroups = [{
        info: listeners.get(noDefault),
        name: noDefault
    }]

    listenerGroups.forEach(group => {

        const info = group.info

        if (info) {

            if (info[listenerObject]) {
                pass(noDefault, {
                    value: info.value,
                    parent: listeners.active,
                    key: group.name,
                    root: info.root,
                    subscription: info.subscription,
                    __value: true
                }, update, context)
            } else if (typeof info === 'object') {
                for (let key in info) {
                    pass(noDefault, {
                        parent: info,
                        key,
                        root: info[key].root,
                        subscription: info[key].subscription,
                        value: info[key].value,
                    }, update, context)
                }
            } else console.error('Improperly Formatted Listener', info)
        }
    })
}



const toSet = Symbol('toSet')
export const create = (config, toMerge = {}, options: Partial<Options> = {}) => {

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

    if (options.clone) config = cloneUtils.deep(config) // NOTE: If this doesn't happen, the reference will be modified by the create function


    // Always fall back to esDOM
    monitor.options.fallbacks = ['esDOM']

    const fullOptions = options as Options

    const components = {}
    const drillOpts = {
        components,
        keySeparator: fullOptions.keySeparator,
        utilities: fullOptions.utilities,
        await: fullOptions.await,
    }

        let instancePromiseOrObject;


        let context;

        const onConnected = (instance) => {

            const noParent = !instance.esParent // Do not wait if no parent is given (since the app is only ready when placed in the DOM)
            
            if (noParent) return instance
            else return new Promise(resolve => {
                 const possiblePromise = instance.esConnected(() => {

                    if (context && options.listen !== false) {
        
                        const toRun = setListeners(context, components)

                        // Triggering appropriate listeners before complete connection
                        toRun.forEach(o => {
                            const res = monitor.get(o.path, 'info')
                            if (typeof res.value === 'function') {
                                const args = (Array.isArray(o.config.esTrigger)) ? o.config.esTrigger : [o.config.esTrigger]
                                res.value(...args)
                            }
                            else console.error('Cannot yet trigger values...', o)
                        })
            
                    }
        
                }, true)

                utils.resolve(possiblePromise, (toRun) => {
                    toRun.forEach(o => o.ref.default(o.args)) // Resolve esTrigger values on the nodes
                    resolve(instance)
                })
        })
        }


        if (options.nested?.parent && options.nested?.name){

            // TODO: Figure out how to pass the path for real...
            instancePromiseOrObject = esDrill(config, options.nested.name, toMerge, options.nested.parent, drillOpts)

            return utils.resolve(instancePromiseOrObject, onConnected)
        } else {

            const id = Symbol('root')
            instancePromiseOrObject = esDrill(config, id, toMerge, undefined, drillOpts)

            const set = (instance) => {

                monitor.set(id, instance, fullOptions.listeners) // Setting root instance

                context = {
                    id,
                    instance,
                    monitor,
                    options: fullOptions
                }

                // Signal connection to the entire application
                return onConnected(instance) // potentially returns a promise
            }

            return utils.resolve(instancePromiseOrObject, set)
        }
}

export default create

export const merge = esMerge
export const clone = cloneUtils.deep
export const resolve = utils.resolve