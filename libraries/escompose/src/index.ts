import Monitor from "../../esmonitor/src"
import createComponent from "./create"
import * as cloneUtils from "../../common/clone.js"
import * as standards from "../../common/standards"
import { Options } from "../../common/types"
import * as utils from "./utils"
import FlowManager from "./FlowManager"
import { ESComponent } from "./component"


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


const esCompile = (o, opts: Options) => {
            
        // Special URL key
        let uri = (typeof o === 'string') ? o : o.esURI

        if (uri && opts.utilities) {

            return new Promise(async (resolve) => {

                try {

                    // Get Text Bundle
                    const bundleOpts = opts.utilities.bundle
                    const compileOpts = opts.utilities.compile

                    if (bundleOpts && typeof bundleOpts.function === 'function') {
                        const options = bundleOpts.options ?? {}
                        if (!options.bundler) options.bundler = 'datauri' // link as datauri
                        if (!options.bundle) options.collection ='global' // same collection across all instances on the page
                        const bundle = bundleOpts.function(uri, options)

                        // Track Bundle Resolution
                        await bundle.compile()
                        o = Object.assign({}, bundle.result)
                    } 
                    
                    // Just Compile
                    else if (compileOpts && typeof compileOpts.function === 'function') {
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
const esDrill = (o, id: string | symbol, toMerge = {}, parent?, directParent?, opts: Partial<Options> = {}, callbacks: any = {}, waitForChildren: boolean = false) => {

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
        const absolutePath = path.join(opts.keySeparator ?? standards.keySeparator)
        if (directParent) directParent[id] = instance // setting immediately

        if (callbacks[id]) callbacks[id](instance)
        if (callbacks.onInstanceCreated) callbacks.onInstanceCreated(absolutePath, instance)

        // ------------------ Convert Nested Components ------------------
        const isReady = () => {
            if (callbacks.onInstanceReady) callbacks.onInstanceReady(absolutePath, instance)
        }

        if (instance.esDOM) {

            let positions = new Set()
            let position = 0;

           const promises = Object.entries(instance.esDOM).map(async ([name, base]: [string, any], i) => {

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


                const promise = esDrill(base, name, undefined, instance, instance.esDOM, opts, callbacks, true); // converting from top to bottom
                Object.defineProperty(instance.esDOM[name], '__esComponentPromise', {
                    value: promise,
                    writable: false,
                })
                
                return resolve(promise)

            })

            // When All Children are Initialized
            const res = resolve(promises, (resolved) => {        
                isReady()
                return resolved
            })

            if (waitForChildren) return resolve(res, () => instance)
        } else isReady()

        return instance
    })

    return res

}


export const create = (config, toMerge = {}, options: Partial<Options> = {}) => {

    // -------------- Create Complete Options Object --------------

    options = cloneUtils.deep(options)
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
        options.monitor = new Monitor(options.monitor)
    }

    if (options.clone) config = cloneUtils.deep(config) // NOTE: If this doesn't happen, the reference will be modified by the create function


    // Always fall back to esDOM
    options.monitor.options.fallbacks = ['esDOM']

    const fullOptions = options as Options

        let instancePromiseOrObject;


        const onConnected = (instance) => {

            const noParent = !instance.esParent // Do not wait if no parent is given (since the app is only ready when placed in the DOM)
            
            if (noParent) return instance
            else return new Promise(resolve => {
                 const possiblePromise = instance.esConnected()
                 
                utils.resolve(possiblePromise, () => {
                    resolve(instance)
                })
        })
        }


        if (options.nested?.parent && options.nested?.name){
            // TODO: Figure out how to pass the path for real...
            instancePromiseOrObject = esDrill(config, options.nested.name, toMerge, options.nested.parent, undefined, fullOptions)
        } else {

            const id = Symbol('root')

            let listeners = {}
            instancePromiseOrObject = esDrill(config, id, toMerge, undefined, undefined, fullOptions, {
                [id]: (instance) => {
                    (options.monitor as Monitor).set(id, instance, fullOptions.listeners) // Setting root instance
                },
                onInstanceCreated: (absolutePath, instance) => {

                    // Set listeners as soon as possible
                    if (fullOptions.listen !== false) {
                        const to = instance.esListeners ?? {}  // Uses to —> from syntax | Always set
                        const manager = listeners[absolutePath] = new FlowManager(to, absolutePath, {
                            id, instance, monitor: fullOptions.monitor, options: fullOptions
                        }) // Uses from —> to syntax
                        instance.esListeners = to // Replace with listeners assigned (in case of unassigned)

                        
                        // Declaring manager
                        Object.defineProperty(instance, '__esManager', {
                            value: manager,
                            enumerable: false,
                            writable: false
                        })

                        // -------- Trigger Execution when Ready --------
                        if ('esTrigger' in instance) {
                            if (!Array.isArray(instance.esTrigger)) instance.esTrigger = []
                            const args = instance.esTrigger
                            manager.onStart(() => instance.default(...args))
                            delete instance.esTrigger
                        }

                    }
                },
                onInstanceReady: (absolutePath) => {
                    listeners[absolutePath].start()
                }
            })
        }

        return utils.resolve(instancePromiseOrObject, onConnected)

}

export default create

export const merge = esMerge
export const clone = cloneUtils.deep
export const resolve = utils.resolve