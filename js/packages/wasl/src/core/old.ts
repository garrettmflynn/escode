import { LatestESC, Options } from "../common/types"
import * as languages from '../common/utils/languages'
import get from '../common/get'
import * as utils from './utils'
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
    #options = {}
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

    get = async (...args) => await get(args[0], args[1], this.#onImport, this.#options).catch(e => e)


    // Load the internal "plugins" field in a ESC file to the dependent node
    load = async (node, info, options, id?: any, symbols?, counter?) => {

        if (node.plugins) {
            for (let nestedName in node.plugins) {

                const nestedNode = node.src.graph?.nodes?.[nestedName]

                for (let key in node.plugins[nestedName]) {
                    const newInfo = node.plugins[nestedName][key]

                    if (typeof newInfo === 'object' && !Array.isArray(newInfo)) {

                        const ogSrc = newInfo.src
                        let newInfoForNode;
                        if (id) newInfoForNode = this.#cache[id]?.[key] // check cache

                        if (!newInfoForNode) {

                            // Properly merge the resolved src info
                            const optsCopy = Object.assign({}, options) as Options
                            if (key === 'graph') optsCopy._deleteSrc = false // keep all node imports
                            else optsCopy._deleteSrc = true

                            newInfoForNode = (await this.resolveOld({ [key]: newInfo }, info, optsCopy, {
                                nodes: newInfo
                            }, symbols, counter))

                            if (id) {
                                if (!this.#cache[id]) this.#cache[id] = {}
                                this.#cache[id][key] = newInfoForNode // cache
                            }
                        }

                        // Only With Node Resolved
                        if (nestedNode) {
                            const newVal = newInfoForNode[key]

                            if (newVal) {
                                let chosenVal = newVal.src ?? newVal
                                // merge default if the only key
                                if ('default' in chosenVal && Object.keys(chosenVal).length === 1) chosenVal = chosenVal.default
                                if (nestedNode) nestedNode[key] = chosenVal // MERGE BY REPLACEMENT
                            } else {
                                this.#throw({ message: `Could not resolve ${ogSrc}` })
                            }
                        }

                    } else if (nestedNode) nestedNode[key] = newInfo // MERGE BY REPLACEMENT
                }

                // Source is Resolved but Node is Not
                if (node.src.graph && !nestedNode) {
                    this.#throw({
                        message: `Plugin target '${nestedName}' does not exist`,
                        node: name
                    })
                }
            }
        }
    }

    // --------- Main ESC Resolution Function ---------
    // This method resolves all the src fields in the ESC file
    resolveOld = async (target, info, options, graph: any = {}, symbols: string[] = [], counter) => {
        const nodes = graph.nodes as any
        const edges = graph.edges as any

        counter++ // increment to show depth of resolution

        const id = Symbol('unique')

        let { url } = info

        const mainPath = info.mainPath || this.#main // use base main if not specified


        const symbolsRegistry = {}
        // const innerTopLevel = options._top === true


        for (let name in target) {

            let symbolsCopy = symbolsRegistry[name] = [...symbols]

            const node = target[name]
            const isObj = node && typeof node === 'object' && !Array.isArray(node)

            if (isObj) {
                await this.load(node, info, options, id, symbolsCopy, counter) // before loading make sure graph is not specified at a higher level
                let ogSrc = node.src ?? '';
                if (utils.isSrc(ogSrc) || (nodes && edges && !ogSrc)) {
                    node.src = null

                    // Option #1: Active ESM source (TODO: Fetch text for ambiguous interpretation, i.e. other languages)
                    let _internal: string | true = '' // don't mistake for user call
                    let _modeOverride = options._modeOverride;
                    let fullPath
                    try {
                        new URL(ogSrc);
                        if (!options._overrideRemote || options._modeOverride === 'import') {
                            _modeOverride = "import";
                            _internal = fullPath = ogSrc;
                        } else fullPath = `${ogSrc.split('://').slice(1).join('/')}` // no protocol
                    } catch {
                        if (ogSrc) fullPath = mainPath ? esm.resolve(ogSrc, mainPath) : esm.resolve(ogSrc);
                    }

                    let mode = options._modeOverride ?? this.#mode

                    // Only Get Source based on the value present (though mainPath will allow for relative resolutions)
                    if (ogSrc) {

                        //Import Mode
                        if (_internal || mode === 'import') {
                            let res = await this.get(fullPath, undefined) as LatestESC
                            const isError = res instanceof Error;
                            if (res && !isError) node.src = res
                            if (!node.src && !node.graph) {
                                utils.remove(ogSrc, fullPath, name, target, res) // remove if no source and no graph
                                if (res) this.#throw({ message: res.message, file: fullPath, type: 'warning' })
                            }
                        }

                        // Reference Mode
                        else {
                            if (this.#filesystem) {

                                let res;

                                res = utils.checkFiles(fullPath, this.#filesystem)
                                const isError = res instanceof Error;

                                if (res && !isError) {

                                    // Handle Node Specifications
                                    if (
                                        res.default // has a default export
                                        || fullPath.includes('.json') // importing a ESC file
                                    ) node.src = res
                                    // Handle Errors
                                    else {
                                        this.#throw({
                                            type: 'warning',
                                            message: `Node (${name}) at ${fullPath} does not have a default export.`,
                                            file: ogSrc
                                        })
                                        node.src = { default: res }
                                    }

                                    _internal = fullPath
                                }
                                else if (ogSrc) {
                                    utils.remove(ogSrc, fullPath, name, target, res)
                                    if (res) this.#throw({ message: res.message, file: fullPath, type: 'warning' })
                                }

                            } else {
                                this.#throw({
                                    message: 'No options.filesystem field to get JavaScript objects',
                                    file: ogSrc
                                })
                            }
                        }
                    }


                    if (!_internal) _internal = (ogSrc) ? esm.resolve(ogSrc, url, true) : true // only set if not already present (e.g. for remote cases)

                    let _top = false
                    if (node.graph) {
                        _top = true
                        if (!node.src) node.src = {}
                        node.src.graph = node.graph
                        delete node.graph
                    }


                    // drill into nested graphs
                    if (node.src && node.src.graph) {
                        await this.init(node.src, {
                            _internal,
                            _deleteSrc: options._deleteSrc,
                            _top,
                            _modeOverride,
                            _overrideRemote: options._overrideRemote
                        }, undefined)
                    } else symbolsCopy.push(fullPath) // ensure flow resolutions are properly scoped

                }

                // Load Embedded Src Files
                for (let key in node) {

                    if (
                        !isObj // Alternative Loading Scheme
                        && key === 'src'
                        && node.src) {

                        const language = node.src.language
                        if (!language || languages.js.includes(language)) {

                            // Option #2: Import full ESM text in JSON object
                            if (node.src.text) {
                                const esmImport = async (text) => {
                                    try {
                                        let imported = await remoteImport.importFromText(text) // ESMPILE TODO

                                        // NOTE: getting default may be wrong
                                        if (imported.default && Object.keys(imported).length === 1) imported = imported.default
                                        return imported
                                    } catch (e) {
                                        console.error('Import did not work. Probably relies on something...')
                                        this.#throw({
                                            message: e.message,
                                            file: name // NOTE: Is wrong...
                                        })
                                    }
                                }

                                const esm = await esmImport(node.src.text)
                                if (esm) {
                                    delete node.src.text
                                    if (typeof esm === 'object') node.src = { default: Object.assign(node.src, esm) }
                                    else node.src = esm
                                } else {
                                    this.#throw({
                                        message: 'Could not import this text as ESM',
                                        file: node.src
                                    })
                                }
                            }

                            // Option #3: Activate JS functions in JSON object
                            else {

                                const expectedFunctions = ['default', 'oncreate', 'onrender']
                                for (let key in node.src) {
                                    try {
                                        if (expectedFunctions.includes(key) && typeof node.src[key] === 'string') node.src[key] = (0, eval)(`(${node.src[key]})`)
                                    } catch (e) {
                                        this.#throw({
                                            message: `Field ${key} could not be parsed`,
                                            file: node.src[key]
                                        })
                                    }
                                }
                            }
                        }

                        // Option #4: Allow downstream application to parse non-JS text
                        else {
                            console.warn(`Text is in ${language}, not JavaScript. This is not currently parsable automatically.`);
                            this.#throw({
                                message: `Source is in ${language}. Currently only JavaScript is supported.`,
                                file: ogSrc
                            })
                        }
                    }

                    // Drill other object keys to replace and merge src...
                    // NOTE: Sometimes duplicates a check because of looking at name === 'graph' again
                    else if (node[key]) {
                        if (typeof node[key] === 'object' && !Array.isArray(node[key])) {
                            const optsCopy = Object.assign({}, options) as Options
                            optsCopy._deleteSrc = key !== 'nodes' && name !== 'graph' // NOTE: Restricted progression
                            await this.resolveOld(node[key], info, optsCopy, { nodes: node[key] }, symbolsCopy, counter) // check for src to merge
                        }
                    }
                }

            }
        }


        // Search the nodes that are produced for .src fields
        // to modify it

        // NOTE: If accompanied by an edges object, this is a full graph
        // and should throw errors

        for (let name in nodes) {

            const node = nodes[name]

            // Merge and validate plugins
            if
                (
                node?.src &&
                typeof node?.src === 'object' // Successfully loaded
            ) {

                // Merge node.plugins info with the actual node (i.e. instance) information
                if (node.src.graph) await this.load(node, info, options, id, symbolsRegistry[name]) // attach to graph

                // Only run if parent is a complete graph (i.e. you're an actual node)
                else if (edges) {

                    // VALIDATE: Source files must have a default export
                    if (!('default' in node.src)) {
                        this.#throw({
                            message: 'No default export.',
                            node: name
                        })
                    }

                }

                nodes[name] = utils.merge(node.src, node)

                // Scrub References for ES Plugins
                if (nodes[name].src?.graph) nodes[name].src.graph = JSON.parse(JSON.stringify(nodes[name].graph)) // deep copy the source graph
            }
        }

        return target
    }
}


export default ESC