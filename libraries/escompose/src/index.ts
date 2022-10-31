import Monitor from "../../esmonitor/src"
import createComponent from "./create"
import * as cloneUtils from "../../common/clone.js"
import * as standards from "../../common/standards"
import { Options } from "../../common/types"
import { ESComponent } from "./component"
import { merge as mergeUtil } from "./utils"


const listenerObject = Symbol('listenerObject')

type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]


const esCompile = async (o, utilities) => {
    if (typeof o === 'string') {

        // Get Text Bundle
        if (typeof utilities.bundle.function === 'function') {
            const foo = utilities.bundle.function
            const options = utilities.bundle.options
            if (!options.bundler) options.bundler = 'datauri' // link as datauri
            if (!options.bundle) options.bundle = Math.random() // link across all bundles
            const bundle = foo(o, options)

            // Track Bundle Resolution
            await bundle.resolve()
            o = Object.assign({}, bundle.result)
            
            // Track Source Text
            if (!o.esSourceText) o.esSourceText = []
            o.esSourceText.push(bundle) // can be string or bundle
        } 
        
        // Just Compile
        else if (typeof utilities.compile.function === 'function') {
            const resolved = await utilities.compile.function(o, utilities.compile.options)
            o = resolved
        } 
        
        // Show Error Message
        else {
            console.error('Cannot transform esCompose string without a compose utility function')
            o = {}
        }

        return cloneUtils.deep(o) 
    }

    return o
}

const esMerge = async (base, esCompose: esComposeType = {}, path: any[] = [], utilities: any = {}) => {

    // Ensure esCompose is an array
    if (!Array.isArray(esCompose)) esCompose = [esCompose]

    // Merge nested esCompose objects
    let clonedEsCompose = await Promise.all(esCompose.map(async o => {

       const compiled = await esCompile(o, utilities) // Resolve from text if required

       let arr: any[] = [compiled]
       let target = compiled
       while (target.esCompose) {
           const val = target.esCompose
           delete target.esCompose
           target = await esCompile(val, utilities) // Resolve from text if required
           arr.push(target)
       }

        return arr
    }))

    const flat = clonedEsCompose.flat()


    // Merge base with full esCompose tree
    let merged = cloneUtils.deep(base) // deep clone
    delete merged.esCompose

    flat.forEach((toCompose) => {
        merged = mergeUtil(toCompose, merged, path)
    })

    return merged
}

// TODO: Ensure that this doesn't have a circular reference
const esDrill = async (o, id: string | symbol, parent?, opts?) => {

    const parentId = parent?.__isESComponent
    const path = (parentId) ? [parentId, id] : ((typeof id === 'string') ? [id] : [])

    // TODO: Search the entire object for the esCompose key. Then execute this merge script
    // ------------------ Merge ESM with esCompose Properties ------------------
    const merged = await esMerge(o, o.esCompose, path, opts.utilities)
    delete merged.esCompose

    // ------------------ Create Instance with Special Keys ------------------
    const instance = createComponent(id, merged, parent, opts.utilities)
    const savePath = path.join(opts.keySeparator ?? standards.keySeparator)
    if (opts?.components) opts.components[savePath] = { instance, depth: (parent) ? path.length + 1 : path.length }

    // ------------------ Convert Nested Components ------------------
    if (instance.esDOM) {
        for (let name in instance.esDOM) {
            const base = instance.esDOM[name]
            const thisInstance = await esDrill(base, name, instance, opts) // converting from top to bottom
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
     if (obj?.hasOwnProperty('__isESComponent')) fromSubscriptionPath.push(standards.defaultPath)

     // Getting Source Path (keep from —> to syntax)
     // and handling configuration object (TODO: Move out to ESMonitor)
     const value = config // Subscription configuration object
     const fromStringPath = topPath.join(context.options.keySeparator)

      // Only subscribe once
     const sub = (!listeners.has(fromStringPath)) ? context.monitor.on(fromSubscriptionPath, (path, _, update) => passToListeners(context, listeners, path, update)): undefined

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

    constructor (monitor, listeners = {}) {
        this.monitor = monitor
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

    clear = () => {
        Object.keys(this.active).forEach(from => {
            Object.keys(this.active[from]).forEach(to => {
                this.remove(from, to)
            })
        })
    }

    has = (from) => !!this.active[from]

    get = (from) => this.active[from]

}

const setListeners = (context, components) => {

    // const listeners = new ListenerManager() // Uses from —> to syntax

    let toTrigger: any[] = []

    for (let root in components) {
        const info = components[root]
        const to = info.instance.esListeners  // Uses to —> from syntax
        const listeners = new ListenerManager(context.monitor, to) // Uses from —> to syntax

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
                    if (info.config.esTrigger) toTrigger.push(info)
                }
            } 
            
            // Immediate Absolute Paths Only
            else {
                if (typeof toPath === 'string') handleListenerValue({...mainInfo, fromPath: from, config: toPath})
                else console.error('Improperly Formatted Listener', to)
            }
        }
    }

   return toTrigger // Trigger after all listeners are set
}


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

    else if (target && type === 'object') {

        // Check if configuration object
        const isConfig = 'esFormat' in ogValue || 'esBranch' in ogValue || 'esTrigger' in ogValue

        if (isConfig) {
            transform(true)
            if (ogValue){
                if (ogValue) config = ogValue
                Object.defineProperty(parent[key], 'esConfig', { value: config })
            }
        }
    }


    // ------------------ Special Keywords ------------------
    let isValidInput = true

    if (config) {

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
            if (noContext) target.call(context.instance, ...arrayUpdate) // Call with top-level context
            else target(...arrayUpdate) // Call with default context
        }

        // Failed
        else {

            let baseMessage = `listener: ${from} —> ${key}`
            if (parent) {
                console.error(`Deleting ${baseMessage}`, parent[key], target)
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
export const create = async (config, options: Partial<Options> = {}) => {

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
        utilities: fullOptions.utilities
    }

    let fullInstance;


    let toTrigger;
    if (options.nested?.parent && options.nested?.name){

        // TODO: Figure out how to pass the path for real...
        fullInstance = await esDrill(config, options.nested.name, options.nested.parent, drillOpts)

        // TODO: Add listeners...

    } else {

        const id = Symbol('root')
        const instance = await esDrill(config, id, undefined, drillOpts)

        fullInstance = instance // cloneUtils.deep(instance)

        monitor.set(id, fullInstance, fullOptions.listeners) // Setting root instance

        const context = {
            id,
            instance: fullInstance,
            monitor,
            options: fullOptions
        }

        toTrigger = setListeners(context, components)
    }

    // Triggering appropriate listeners before connection
    toTrigger.forEach(o => {
        const res = monitor.get(o.path, 'info')
        if (typeof res.value === 'function') {
            const args = (Array.isArray(o.config.esTrigger)) ? o.config.esTrigger : [o.config.esTrigger]
            res.value(...args)
        }
        else console.error('Cannot yet trigger values...', o)
    })

    // Signal connection to the entire application
    fullInstance.esConnected()

    return fullInstance as ESComponent
}

export default create

export const merge = esMerge
export const clone = cloneUtils.deep