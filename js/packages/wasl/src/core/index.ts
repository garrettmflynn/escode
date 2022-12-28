import { LatestESC, Options } from "../common/types"
import * as languages from '../common/utils/languages'
import get from '../common/get'
import * as check from '../common/utils/check'
import * as utils from './utils'
import * as html from './html'

import * as esm from 'esmpile'
import ESPlugin from "es-plugins/dist/index.esm"

const basePkgPath = './package.json'
const moduleStringTag = '[object Module]'

class ESC {

    errors: any[] = []
    warnings: any[] = []
    files: { [x: string]: any } = {}
    plugin?: ESPlugin

    // Records
    original?: { [x: string]: any } = {}
    resolved?: { [x: string]: any } = {}

    debug: undefined | { [x: string]: any } = undefined


    #filesystem: Options['filesystem']


    #input = {}
    #options: Options = {}
    #url = undefined
    #cache = {}
    #main = ''
    #mode = 'import'

    #onImport = (path, info) => this.files[path] = info

    #throw = (e) => {
        const item = {
            message: e.message,
            file: e.file,
            node: e.node,
        }

        const arr = (e.type === 'warning') ? this.warnings : this.errors
        arr.push(item)
    }

    constructor(
        urlOrObject: string | LatestESC,
        options: Options = {},
        url?: string
    ) {

        this.#input = urlOrObject
        this.#options = options
        this.#url = url

    }


    // --------- Main ESC Initialization Function ---------
    // This method loads and merges all the src files
    init = async (
        urlOrObject: string | LatestESC = this.#input,
        options: Options = this.#options,
        url: string = ''
    ) => {

        this.debug = undefined // no debug behavior specified        
        
        const internalLoadCall = options._internal
        const isFromValidator = !this.#main && typeof internalLoadCall === 'string'

        // Original User Call
        if (!this.#input) this.#input = urlOrObject
        if (!this.#options) this.#options = options
        if (!this.#filesystem) this.#filesystem = options.filesystem

        if (!internalLoadCall) {
            if (!url) url = this.#url // only use for the top-level call

            // Scrub Options for Remote
            try {
                new URL(url ?? urlOrObject)
                options.relativeTo = ''
            } catch { }
        }
        else if (internalLoadCall === true) url = this.#main // use for internal unspecified calls

        // Possibly From Validator
        if (isFromValidator) url = this.#main = internalLoadCall as string// validator input for import syntax

        const clonedOptions = Object.assign({}, options) as Options
        // const isTopLevel = clonedOptions._top !== false
        const innerTopLevel = clonedOptions._top === true
        const isString = typeof urlOrObject === 'string'
        const isHTML = urlOrObject instanceof HTMLElement

        let mode, object, mainPath; // catch internal calls

        // ----------------------- Local Mode Handling -----------------------
        if (isHTML) {
            object = html.from(urlOrObject, options)
            if (options.path) mode = 'import' // should try importing first
            else {
                if (options.filesystem) mode = 'reference' // empty paths will use reference mode
                else mode = 'import' // no options will default to import

            }
        } else if (typeof urlOrObject === 'object') {
            object = Object.assign({}, urlOrObject)
            if (typeof internalLoadCall === 'string') url = mainPath = esm.resolve(internalLoadCall) // use internal call as base
            mode = 'reference'
        } else if (url || (isString)) {
            if (!url) url =  (urlOrObject[0] === '.') ? esm.resolve(urlOrObject, options.relativeTo ?? '') : urlOrObject // Use Relative vs Absolute Path
            mode = 'import'
        }
        else console.error('Mode is not supported...')

        if (!internalLoadCall) this.#mode = mode // set global mode


        mode = clonedOptions._modeOverride ?? this.#mode // set local to global mode

        // Check if input is valid
        this.errors.push(...check.valid(urlOrObject, clonedOptions, 'load'))

        // maintain a reference to the main path

        // ------------------- Merge package.json and (optionally) resolve object-------------------
        this.original = object
        
        switch (mode) {
            case 'reference':

                // Graphs Nested in the Top Level Don't Have a package.json File
                if (!innerTopLevel) {
                    if (this.#filesystem) {
                        const pkgPath = esm.resolve(basePkgPath, url)
                        const pkg = utils.checkFiles(pkgPath, this.#filesystem)
                        if (pkg) object = Object.assign(pkg, isString ? {} : object) as any
                    }
                }
                break;

            default:
                if (!object) {
                    mainPath = await esm.resolve(url)
                    this.original = await this.get(mainPath, undefined) as LatestESC
                    object = JSON.parse(JSON.stringify(this.original))
                    if (!innerTopLevel) {
                        const pkgUrl = esm.resolve(basePkgPath, mainPath, true)
                        const pkg = await this.get(pkgUrl, undefined)
                        if (pkg) object = Object.assign(pkg, object) as any
                    }
                }
                break;

        }

        if (!internalLoadCall) this.#main = mainPath // save global main path
        else if (this.#mode === 'reference' && !this.#main) this.#main = '' // ensures root scope

        if (this.errors.length === 0) {

            const copy = isHTML ? this.original : JSON.parse(JSON.stringify(this.original))

            // Resolve without including information from pkg
            this.resolved = await this.resolve(copy, { mainPath, mode }, options)

            // convert valid nodes to ES Plugins
            const drill = (parent, callback) => {
                const nodes = parent.components
                for (let tag in nodes) {
                    const res = callback(nodes[tag], {
                        tag,
                        parent,
                        options: clonedOptions
                    })

                    if (res) nodes[tag] = res
                }
            }

            // -------------------------- do plugin-dependent tests --------------------------
            const drillToTest = (target) => {
                drill(target, (node, info) => {

                    // VALIDATE: Check that all edges point to valid nodes
                    // TODO: Validate children...
                    const connections = info.parent.listeners
                    for (let output in connections) {

                        const getTarget = (o, str) => o.components?.[str] ?? o[str]

                        let outTarget = info.parent.components
                        output.split('.').forEach((str) => outTarget = getTarget(outTarget, str))

                        if (!outTarget) {
                            this.#throw({
                                message: `Node '${output}' (output) does not exist to create an edge.`,
                                file: url,
                            })
                        }

                        for (let input in connections[output]) {
                            let inTarget = this.resolved.components
                            input.split('.').forEach((str) => inTarget = getTarget(inTarget, str))
                            if (!inTarget) {
                                this.#throw({
                                    message: `Node '${input}' (input) does not exist to create an edge.`,
                                    file: url,
                                })
                            }
                        }
                    }

                })
            }

            // -------------------------- initialize plugins --------------------------
            if (internalLoadCall === undefined) {
                if (clonedOptions.output !== 'object') {

                    // Convert to ES Plugin
                    this.plugin = new ESPlugin(this.resolved, {
                        activate: clonedOptions.activate,
                        parentNode: clonedOptions.parentNode
                    })

                    // Derive Original Input
                    return this.plugin
                } else this.original = this.resolved

                // TODO: Check edges still...
                drillToTest(this.resolved) // test
            }

            return this.resolved
        }
    }

    start = async () => {
        if (this.plugin) return await this.plugin.start()
    }

    stop = async () => {
        if (this.plugin) return await this.plugin.stop()
    }

    get = async (...args) => await get(args[0], args[1], this.#onImport, this.#options).catch(e => e)

    // ------------------------------- NEW METHODS -------------------------------
    // This method resolves the JavaScript object associated with a source string
    resolveSource = async (path, modeOverride, {
        useCache = true,
        mode = 'reference'
    } = {}) => {

        const activeMode = modeOverride ?? mode // fallback to options

        //Import Mode
        let res = null

        if (activeMode === 'import') {

            // Cached Version
            if (this.#cache[path] && useCache) {
                console.warn('Found cached component', path)
                res = this.#cache[path]
            } 
            
            // Remote Version
            else res = await this.get(path, undefined) as LatestESC
        }

        // Reference Mode
        else if (this.#filesystem) res = utils.checkFiles(path, this.#filesystem)
        else {
            this.#throw({
                message: 'No options.filesystem field to get JavaScript objects',
                file: path
            })
        }

        return res
    }


    // This method searches the JSON object for a search key and uses the onFound callback to notify the user + provide additional metadata.
    search = async (input, searchKey = 'src', {
        condition = (value) => typeof value === 'string',
        onFound = async (o, acc: any = []) => acc.push(o),
        mainPath,
        nestedKey,
        mode
    }) => {


        const top = input
        let found;

        const pathMap = {}
        // const infoMap = {}
        // const infoRegistry = {}

        const drill = async (input, tree=[]) => {

            // Handle Search Key
            const parentInfo = tree[tree.length - 1]

            const path = tree.map((o) => o.key)
            const graphSlice = path.slice(-3)

            const get = (pathInfo=path) => {
                let target = top
                pathInfo.forEach((str,i) =>target = target[str])
                return target
            }

            const set = (input, key=searchKey, pathInfo=path) => {
                let target = top
                pathInfo.forEach((str,i) => {
                     if (!target[str]) target[str] = {}
                    target = target[str]
                })
                target[key] = input
            }

            if (condition(input[searchKey])) {

                const isComponent = graphSlice.slice(-2)[0] === 'components' // Got an internal component


                // Remap Path from Override Transformations
                let target = pathMap
                path.forEach((str,i) => target = target[str] ?? target)
                const pathArray = (Array.isArray(target))  ? path.map((str,i) => target[i] ?? str) : path

                // let overrides = infoMap
                // path.forEach((str,i) => overrides = overrides[str] ?? overrides)

                let o = {

                    // Resolution Info
                    mainPath,
                    mode,
                    isComponent,

                    paths: {
                        original: path,
                        remapped: pathArray
                    },

                    // Value Info
                    get,
                    set,
                    key: searchKey,
                    value: input[searchKey],
                    
                    // Set Parent Reference
                    setParent: function (input, path=this.paths.remapped, fallbackKey) {
                        let target = top
                        path.forEach((str,i) => {
                            if (i === path.length - 1) {
                                if (fallbackKey && target[str] && Object.keys(target[str]).length > 1) {
                                    console.warn(`Setting ${fallbackKey} instead of replacing parent for ${path.join('.')}`)
                                    target[str][fallbackKey] = input;
                                } else target[str] = input;
                            }
                            else {
                                if (!target[str])  target[str] = {}
                                target = target[str]
                            }
                        })
                    },

                    // Parent Info
                    parent: parentInfo?.reference,
                    name: parentInfo?.key,

                    // ...overrides
                }

                // infoRegistry[path.toString()] = o

                // Mark as Resolved
                input[searchKey] = null

                if (onFound) {
                    const got = await onFound(o, found)
                    if (got && typeof got === 'object') found = got
                }
            }


            
            // Catch Certain Info
            if (nestedKey) {

                const offset = path.length - graphSlice.length
                for (let key in nestedKey) {
                    let i = 0
                    
                    const pattern = nestedKey[key].pattern
                    const match = (pattern) ? pattern.reduce((a,o) => {
                        let str = o?.key ?? o
                        let adjacencies = o?.adjacencies
                        if (typeof str === 'string') a *= ((graphSlice[i] === str) ? 1 : 0)
                        if (adjacencies) a *= adjacencies.reduce((a,str) => {
                            a *=(str in get(path.slice(0,offset+i)) ? 1 : 0)
                            return a
                        }, 1)
                        
                        i++
                        return a
                    }, 1) : 1

                    const projection = nestedKey[key].projection ?? pattern
                    // const update = nestedKey[key].update

                    if (match) {

                            await nestedKey[key].function(input, {
                            get: (key, additionalPath=[]) => get([...path, ...additionalPath, key]),
                            set: (key, name, value, additionalPath=[]) => {
                                const base = [...path.slice(0,offset), ...projection.map((str,i) => (!str) ? graphSlice[i] : str)]
                                const passed = [...base, ...additionalPath, name]
                                set(value, key, passed) // relative

                                // Remap override source resolutions to the new object
                                let targets = [
                                    {
                                        target: pathMap,
                                        update: passed,
                                        array: graphSlice
                                    }, 
                                    // {
                                    //     target: infoMap,
                                    //     array: path
                                    // }
                                ]

                                const create = (target, array) => {
                                    array.forEach(str => {
                                        if (!target[str]) target[str] = {}
                                        target = target[str]
                                    })
                                    return target
                                }

                                targets.forEach(o => {
                                    const target = create(o.target, o.array)
                                    if (o.update) target[name] = o.update /// absolute
                                    o.target = target
                                })
                                
                                // const map = targets[1].target
                                // const baseStr = base.slice(0,-1).toString()
                                // const parentInfo = infoRegistry[baseStr]
                                // if (update) update(map, parentInfo)

                            },
                            delete: () => delete get([...path])[key],
                        }) // intercept key
                    }
                }
            }

            // Drill the Object for the Search Key
            for (let key in input) {
                if (
                    input[key] // Is defined
                    && typeof input[key] === 'object' // Is an object
                    && !(input[key] instanceof HTMLElement) // Is not an HTML Element
                ) await drill(input[key], [...tree, { reference: input, key }])
            }

        }

        await drill(input)

        return found
    }


    // This method searches the JSON object for the "src" field and adds additional information to the found object
    findSources = async (graph, events, opts) => {

        return await this.search(graph, undefined, {
            mode: opts.mode,
            nestedKey: events.nested,
            onFound: async (o, acc = {}) => {

                // Add Type
                o.type = 'local'

                try {
                    new URL(o.value);
                    o.type = 'remote'
                } catch { }

                const isRemote = o.type === 'remote'
                const isAbsolute = o.value[0] !== '.'

                // Add Path
                const main = o.mainPath || this.#main // use base main if not specified
                const rootRelativeTo = this.#options.relativeTo
                const isMainAbsolute = main?.[0] !== '.'

                let absoluteMain; 
                if (!main) absoluteMain = rootRelativeTo
                if (isMainAbsolute) absoluteMain = main
                else absoluteMain = main.includes(rootRelativeTo) ? main : esm.resolve(main, rootRelativeTo)

                if (isRemote) o.path = o.value
                else if (isAbsolute) o.path = await esm.nodeModules.resolve(o.value, {
                    rootRelativeTo,
                    nodeModules: this.#options.nodeModules,
                })
                else {
                    if (main){
                        o.path = esm.resolve(o.value, absoluteMain)
                        o.id = esm.resolve(o.value, main)
                    } else o.path = o.id = esm.resolve(o.value)
                }

                if (isRemote || isAbsolute) o.id = o.path

                // Change Import Method
                if (isRemote) o.mode = 'import'

                // Add to Accumulator
                const ext = o.value.split('/').pop().split('.').slice(1).join('.')
                if (ext === 'esc.json') {
                    if (events.components) await events.components(o)
                    // else o.isComponent = false
                    return null
                } else {
                    if (!acc[ext]) acc[ext] = {}
                    if (!acc[ext][o.path]) acc[ext][o.path] = []
                    acc[ext][o.path].push(o)
                    return acc
                }
            },
            mainPath: opts.mainPath
        })
    }

    // This method resolves all source values in the JSON object
    // 1. Collect all the source strings and notify of remote graphs that are resolved
    // 2. Flatten the source strings found in internal graphs into the main collection
    // 3. Resolve all the source strings into JavaScript objects and notify the user of their resolution
    resolve = async (graph, context, opts: Options={}) => {

        const remote = [] // don't immediately resolve
        const nested = [] // to merge

        const foundInternal = {}

        // Resolve Graphs Immediately + Merge Plugins
        const events = {
            components: (info) => this.handleComponent(info, events, context, opts, remote, foundInternal),
            nested: {
                overrides: {
                    pattern: ['components', null, {key: 'overrides', adjacencies: ['src']}],
                    projection: ['components', null, 'components'],
                    function: (value, info) => this.handleOverride(value, info, nested),
                    update: (o, info) => {
                        o.mainPath = info.path // set mainPath to 
                    }
                }
            }
        }

        // ---------------------------- Get All Sources ----------------------------
        // Find Sources
        const found = await this.findSources(graph, events, context) ?? {} // might not have sources

        // Transfer Sources 
        this.flattenInto(foundInternal, found)

        // ---------------------------- Resolve Non-Graph Sources ----------------------------
        const tic = performance.now()
        const total = Object.keys(found).reduce((acc, key) => acc + Object.keys(found[key]).length, 0)

        let i = 0;

        // Asynchronously Resolve All Sources
        await Promise.all(Object.values(found).map(async (typeInfo) => {
            await Promise.all(Object.entries(typeInfo).map(async ([path, pathInfo]) => {
                console.log('Sent out', path, pathInfo)
                const res = await this.resolveSource(path, pathInfo[0].mode) // will remain consistent...
                console.log('Got', path, res)

                await Promise.all(pathInfo.map(async (info) => await this.handleResolved(res, info)))
                i++
                const pathId = esm.path.pathId(path, this.#options)
                if (opts.callbacks?.progress?.source instanceof Function) opts.callbacks.progress?.source(pathId, i, total)
            }))
        }))

        const toc = performance.now()

        if (this.#options.debug) console.log('Resolved', total, 'sources in', (toc - tic).toFixed(3), 'ms')
        return graph
    }


    // This method updates the context of the current source resolution
    updateContext = (info, context) => {
        return {
            ...context,
            mainPath: info.path,
            mode: (info.type === 'remote') ? 'import' : context.mode
        }
    }

    // This methods flattens found entries into each other
    flattenInto = (o1, o2) => {
        for (let type in o1) {
            for (let path in o1[type]) {
                if (!o2[type]) o2[type] = {}
                if (!o2[type][path]) o2[type][path] = []
                o2[type][path].push(...o1[type][path])
            }
        }
    }

    // This method handles a resolved source string, and will be called for every source value in the JSON object.
    handleResolved = (res, info) => {

        const ogSrc = info.value
        const name = info.name


        // Handle Error
        const isError = res instanceof Error;

        // Check if ES Module
        const isModule = res && (!!Object.keys(res).reduce((a,b) => {
            const desc = Object.getOwnPropertyDescriptor(res, b)
            const isModule = (desc && desc.get && !desc.set) ? 1 : 0
            return a + isModule
        }, 0) || Object.prototype.toString.call(res) === moduleStringTag)

        const isESC = info.path.includes('esc.json')

        const deepSource = (!isModule || !info.isComponent) && !isESC

        // Handle Source Differently based on Flags
        const handlers = {
            _format: {
                'path': info.path,
                'datauri': res,
                'object': res,
            }
        }

        const parent = info.parent[info.name]
        for (let name in handlers._format) {
            if (parent._format === name) res = handlers._format[name]
            delete parent[name]
        }

        // Could not Resolve the Source Value
        if (!res || isError) {
            utils.remove(ogSrc, info.id, name,  deepSource ? undefined : info.parent, res) // remove if no source
            if (res) this.#throw({ message: res.message, file: info.path, type: 'warning' })
            return // stop execution here
        }

        // Assign the Source Value

        if (res !== undefined) {

            // Set Source
            if (deepSource) info.setParent((isModule && res.default) ? res.default : res, undefined, info.key)
            else {
                info.set(res) // set src key on the main reference
                const ref = info.get()
                info.setParent(utils.merge(ref[info.key], ref)) // merge source into the parent node
            }

            return res // return when resolved appropriately
        }
    }

    // This method responds to a new (remote) component se that is found
    handleComponent = async (info, events, context, opts, acc = [], list = {}) => {

        const newContext = this.updateContext(info, context)
        info.mode = newContext.mode // align modes
        const res = await this.resolveSource(info.path, info.mode, newContext)
        if (!res) {
            console.error('Not resolved', info.path, info)
            return 
        }

        const found = await this.findSources(res, events, newContext)
        if (opts.callbacks?.progress.components instanceof Function) opts.callbacks.progress.components(info.path, acc.length, res)

        // Register Internal Sources
        if (found) this.flattenInto(found, list)

        await this.handleResolved(res, info)

        acc.push(info) // accumulate graphs
        return acc
    }

    // This methods responds to the "overrides" keyword, flattening entries into the nested graphs
    handleOverride = async (value, info, acc = [], pathUpdate=[]) => {
        
        for (let nestedName in value) {

            const nestedNode = info.get(nestedName, pathUpdate)
            
            // Merge Specified Information into the Node (will keep sources as strings...)
            if (nestedNode) {
                for (let key in value[nestedName]) {
                    if (key === "components") this.handleOverride(value[nestedName][key], info, [], [...pathUpdate, nestedName, key])
                    else {
                        const newInfo = value[nestedName][key]
                        if (newInfo) info.set(key, nestedName, newInfo, pathUpdate) 
                    }
                }
            } else this.#throw({
                message: `Plugin target '${nestedName}' does not exist`,
                node: name
            })

            acc.push(value)
        }

        return acc
        info.delete() //delete value[info.refKey]

    }

}


export default ESC