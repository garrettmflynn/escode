import * as pathUtils from './utils/path.js'
import * as encode from "./utils/encode/index.js";
import * as mimeTypes from "./utils/mimeTypes.js";
import * as compile from "./utils/compile.js"
import * as response from "./utils/response.js"
import * as nodeModules from './utils/nodeModules.js'
import * as errors from './utils/errors.js'
import * as polyfills from './utils/polyfills.js'
import * as sourceMap from './utils/sourceMap.js';
import { esSourceKey } from '../../../../spec/properties.js';

if (!globalThis.REMOTEESM_BUNDLES) globalThis.REMOTEESM_BUNDLES = {global: {}} // Share references between loaded dataurl instances
const global = globalThis.REMOTEESM_BUNDLES.global

const noEncoding = `No buffer or text to bundle for`

const toWait = 10000
const waitedFor = (toWait/1000).toFixed(1)

const esSourceString = (bundle) => `
export const ${esSourceKey} = () => globalThis.REMOTEESM_BUNDLES["${bundle.collection}"]["${bundle.name}"];
` // Export bundle from module...

// Import ES6 Modules (and replace their imports with actual file imports!)
// TODO: Handle exports without stalling...
// const re = /[^\n]*(?<![\/\/])(import|export)\s+([ \t]*(?:(?:\* (?:as .+))|(?:[^ \t\{\}]+[ \t]*,?)|(?:[ \t]*\{(?:[ \t]*[^ \t"'\{\}]+[ \t]*,?)+\}))[ \t]*)from[ \t]*(['"])([^'"\n]+)(?:['"])([ \t]*assert[ \t]*{[ \n\t]*type:[ \n\t]*(['"])([^'"\n]+)(?:['"])[\n\t]*})?/gm
const re = /([^\n]*)(import)\s+([ \t]*(?:(?:\* (?:as .+))|(?:[^ \t\{\}]+[ \t]*,?)|(?:[ \t]*\{(?:[ \t]*[^ \t"'\{\}]+[ \t]*,?)+\}))[ \t]*)from[ \t]*(['"])([^'"\n]+)(?:['"])([ \t]*assert[ \t]*{[ \n\t]*type:[ \n\t]*(['"])([^'"\n]+)(?:['"])[\n\t]*})?;?/gm
export function get(url, opts=this.options){
    const pathId = (url) ? pathUtils.pathId(url, opts) : undefined // Set Path ID
    let ref = globalThis.REMOTEESM_BUNDLES[opts.collection]
    if (!ref) ref = globalThis.REMOTEESM_BUNDLES[opts.collection] = {}
    let bundle = ref[pathId]
    if (!bundle)  bundle =  new Bundle(url, opts)
    else if (opts) bundle.options = opts // Reset options
    return bundle
}

const promiseInfo = {
    resolve: undefined,
    reject: undefined,
    promise: undefined
}


export default class Bundle {

    filename = 'bundle.esmpile.js'

    promises = {
        encoded: Object.assign({},promiseInfo),
        result: Object.assign({},promiseInfo)
    }

    uri;

    #url 
    get url() { return this.#url }
    set url(url) {
        const ESMPileInternalOpts = this.options._esmpile
        if (!ESMPileInternalOpts.entrypoint) ESMPileInternalOpts.entrypoint = this

        if (!this.uri) this.uri = url // set original uri

        // Transform for absolute targeting
        const isAbsolute = pathUtils.absolute(url, true)
        if (!isAbsolute && !url.includes(this.#options.relativeTo)) url = pathUtils.get(url, this.#options.relativeTo)
        this.#url = url
        const pathId = pathUtils.pathId(this.url, this.options)
        if (this.name !== pathId) this.name = pathId // derive a name
        this.updateCollection(this.options.collection)
    }

    status = null
    #options
    get options() {return this.#options}
    set options(opts={}) {

            if (!opts._esmpile) opts._esmpile = this.#options?._esmpile ?? {circular: new Set()} // keep internal information

            
            if (!opts.collection) opts.collection = this.#options?.collection // keep collection

            this.#options = opts

            if (!opts.output) opts.output = {}

            // ------------------- Set Bundler -------------------
            this.bundler = opts.bundler

            // ------------------- Set Bundle Collection -------------------
            this.updateCollection(this.options.collection)

            // ------------------- Derived Properties -------------------
            if (typeof opts?.callbacks?.progress?.file === 'function') this.callbacks.file = opts.callbacks.progress.file


            // Default Fetch Options
            if (!opts.fetch) opts.fetch = {}
            opts.fetch = Object.assign({}, opts.fetch) // shallow copy
            opts.fetch.signal = this.controller.signal
    }

    controller = new AbortController()

    // ------------------- Toggle Bundle Encoding -------------------
    #bundler;
    get bundler() { return this.#bundler }
    set bundler(bundler) {
        this.setBundleInfo(bundler)
        this.setBundler(bundler, false)
    }

    setBundleInfo = (bundler) => {
        this.#options._esmpile.lastBundler = this.#bundler
        this.#bundler = this.#options.bundler = bundler

        const output = this.#options.output
        if (bundler) {
            output[bundler] = true // default bundler option to true
            output.text = true
        }

        this.derived.compile = !this.#options.forceNativeImport && (output.text || output.datauri || output.objecturl)
    }

    setBundler = async (bundler, setInfo = true) => {
            if (setInfo) this.setBundleInfo(bundler)

            const innerInfo = this.#options._esmpile
            const lastBundleType = innerInfo.lastBundle

            const isSame = innerInfo.lastBundle === bundler
            if (
                !isSame  // if bundler has changed
                || (innerInfo.lastBundle && isSame && !lastBundleType) // no last bundle type (when expected)
            ) {

                const entrypoint = innerInfo.entrypoint
                if (bundler) {
                    const entries = Array.from(this.dependencies.entries())

                    if (entries.length) {
                        await Promise.all((entries).map(async ([_, entry]) => {
                            entry.bundler = bundler
                            await entry.result
                        })) // set bundler for all entries
                    }

                    // console.warn('Awaited all!', this.uri)

                }

                const isComplete = ['success', 'failed']
                if (isComplete.includes(entrypoint?.status)) {
                    // console.log('Creating a promise')
                    if (!bundler) this.result = await this.resolve() // Direct Import
                    else if (lastBundleType) this.encoded = await this.bundle(lastBundleType) // Swap Bundler Type
                    else this.result = await this.resolve() // Full Resolution
                }
            }
    }

    // Name Property
    #name;
    get name() { return this.#name }
    set name (name) {

        // set new name
        if (name !== this.#name){

            // remove existing reference
            let collection = globalThis.REMOTEESM_BUNDLES[this.collection]
            if (collection){
                if (global[this.name] === collection[this.name]) delete global[this.name] // delete from global collection
                delete collection[this.name] // delete from parent collection
            }

            this.#name = name

            // set filename
            let filename = name.split('/').pop()
            const components = filename.split('.')
            this.filename = [...components.slice(0,-1), 'esmpile', 'js'].join('.')


            // register in global
            if (!global[this.name]) global[this.name] = this
            else if (
                this.options.collection != 'global'
                //  && this.options.debug
            ) console.warn(`Duplicating global bundle (${this.name})`, this.name)
        }
    }

    // Register Bundle in Collection
    #collection;
    get collection() { return this.#collection }
    set collection(collection) {

        // if (collection !== this.#collection) {
        this.#collection = collection
        let ref = globalThis.REMOTEESM_BUNDLES[collection]
            if (!ref) ref = globalThis.REMOTEESM_BUNDLES[collection] = {}
            if (this.name) {
                if (!ref[this.name]) ref[this.name] = this
                else if (
                    ref[this.name] !== this
                ) console.warn(`Trying to duplicate bundle in bundle ${collection} (${this.name})`, this.name)
            } //else console.warn('No name to set collection')
        // }
    }

    // Update Bundle
    #text
    #buffer
    get text() {
        return this.#text ?? this.info.text.original
    }
    set text(text) {
        this.#text = text
        this.encoded = this.bundle('text').catch(e => { 
            if (!e.message.includes(noEncoding)) throw e 
        }) 
    }

    set buffer(buffer) {
        this.#buffer = buffer
        this.encoded = this.bundle('buffer').catch(e => { if (!e.message.includes(noEncoding)) throw e }) // New info creates new bundle
    }

    dependencies = new Map()
    dependents = new Map()

    get entries(){

        let entries = []

        const drill = (target) => {
            target.dependencies.forEach(o => {
                if (!entries.includes(o) && o !== this) {
                    entries.push(o)
                    drill(o)
                }
            })
        }

        drill(this)

        return entries
    }

    encodings = {}

    info = {}

    imports = []

    link = undefined
    result = undefined

    callbacks = {
        file: undefined,
    }

    derived = {
        compile: false,
        dependencies: {n: 0, resolved: 0}
    }

    constructor(entrypoint, options={}) {

        this.options = options
        this.url = entrypoint
    }

    import = async () => {

        this.status = 'importing'

         const info = await response.findModule(this.url, this.options)
        
         
         // Direct import was successful
         if (info?.result) return info.result
         else this.status = 'fallback'
    }

    get = get

    compile = async () => {

        this.status = 'compiling'

        await polyfills.ready // Make sure fetch is ready

        try {
            
            const info = await response.findText(this.url, this.options).catch(e => { throw e })

            try {

                if (info){
                    this.info = info
                    this.url = this.info.uri // reset this bundle's name
                    this.buffer = this.info.buffer
                    await this.encoded // resolve after successful encoding  
                }
            }

            // ------------------- Replace Nested Imports -------------------
            catch (e) {

                // console.warn('initial error', e)

                // ------------------- Get Import Details -------------------
                this.imports = {} // permanent collection of imports
                const imports = [] // temporary
                const matches = Array.from(this.info.text.updated.matchAll(re))
                matches.forEach(([original, before, prefix, command, delimiters, path]) => {

                    if (before.includes('//')) return; // No comments

                    if (path){
                        const wildcard = !!command.match(/\*\s+as/);
                        const variables = command.replace(/\*\s+as/, "").trim();

                        const absolutePath = pathUtils.absolute(path)
                        let name = (absolutePath) ? path : pathUtils.get(path, this.url);
                        const absNode = nodeModules.path(this.options)
                        name = name.replace(`${absNode}/`, '')
    
                        const info = {
                            name,
                            path,
                            prefix,
                            variables,
                            wildcard,
                            current: {
                                line: original,
                                path
                            },
                            original,
                            counter: 0,
                            bundle: null
                        }
            
                        if (!this.imports[name]) this.imports[name] = [];
                        this.imports[name].push(info)
                        imports.push(info)
                    }
                })

                this.derived.dependencies.resolved = 0
                this.derived.dependencies.n = this.imports.length

                // ------------------- Import Files Asynchronously -------------------
                const promises = imports.map(async (info, i) => {
                    await this.setImport(info, i)
                    this.derived.dependencies.resolved++
                })

                await Promise.all(promises)

                this.text = this.info.text.updated // trigger recompilation from text
            }

        } 
        // ------------------- Catch Aborted Requests -------------------
        catch (e) {
            // console.log('compile error', e)
            throw e
        }

        await this.encoded

        return this.result
    }

    updateImport = (info, encoded) => {
        
        if (encoded === info.current.path) return
        const { prefix, variables, wildcard, bundle } = info;

        let newImport = '';
        // ----------- Native Imports -----------
        if (typeof encoded === "string") newImport = `${prefix} ${wildcard ? "* as " : ""}${variables} from "${encoded}"; // Imported from ${bundle.name}\n\n`

        // ----------- Passed by Reference (e.g. fallbacks) -----------
        else {
            
            const replaced = variables.replace('{', '').replace('}', '')
            const exportDefault = (replaced === variables) ? true : false
            const splitVars = variables.replace('{', '').replace('}', '').split(',').map(str => str.trim())

            const insertVariable = (variable) => {
                let end = ''
                if (!wildcard) {
                    if (exportDefault) end = `.default`
                    else end = `.${variable}`
                }
                newImport += `${prefix === 'import' ? '' : 'export '}const ${variable} = (await globalThis.REMOTEESM_BUNDLES["${bundle.collection}"]["${bundle.name}"].result)${end};\n\n`;
            }

            splitVars.forEach(insertVariable)
        }

        // Update Line Text
        this.info.text.updated = this.info.text.updated.replace(info.current.line, newImport)

        info.current.line = newImport
        info.current.path = encoded

    }

    setImport = async (info) => {
            let path = info.path        
            let correctPath = info.name

            // Get Dependency Bundle
            const bundle = this.get(correctPath) 
            info.bundle = bundle

            this.addDependency(bundle)
    
            // Get Bundle Value
            if (!bundle.status) {
                const options = { output: {}, ...this.options }
                options.output.text = true // import from text
                const newBundle = await this.get(correctPath, options)
                await newBundle.resolve(path)
            } else {
                // console.log('waiting...', this.uri, bundle.uri)

                let done = false

                setTimeout(() => {
                    if (done) return
                    console.error(`Took too long (${waitedFor}s)...`, bundle.uri)
                    bundle.promises.result.reject()
                    bundle.promises.encoded.reject()
                }, toWait)
                
                await bundle.result // wait for bundle to resolve
                // console.log('done!', this.uri, bundle.uri)
                done = true

            }
    
            // Update Original Input Texts
            const encoded = await bundle.encoded 

            this.updateImport(info, encoded)

            return bundle
    }

    notify = (done, failed) => {

        const isDone = done !== undefined
        const isFailed = failed !== undefined

        // ------------------- Tell the User the File is Done -------------------
        if (this.callbacks.file) this.callbacks.file(this.name, this.derived.dependencies.resolved, this.derived.dependencies.n, isDone ? this : undefined, isFailed ? failed : undefined) 
    }

    get buffer() {return this.#buffer}


    // Get Encoded Promise
    bundle = (type="buffer") => {

        const isText = type === "text"
        this.options._esmpile.lastBundle = type // register last bundle type
        this.promises.encoded.promise = new Promise (async (resolve, reject) => {

            this.promises.encoded.resolve  = resolve
            this.promises.encoded.reject  = reject

            try {

            let bufferOrText = (isText) ? this.info.text.updated :  this.buffer 

                if (!bufferOrText) {
                    if (this.info.fallback) this.encoded = this.info.fallback
                    else reject(new Error(`${noEncoding} ${this.name}`))
                }
        
                // Compile Code
                const pathExt = pathUtils.extension(this.url)
                let mimeType = mimeTypes.get(pathExt)
                switch (mimeType) {
                    case 'text/typescript':
                        bufferOrText = compile.typescript(this.info, type)
                        mimeType = mimeTypes.js
                        break;
                }

                if (mimeType === mimeTypes.js) {
                    // Always Add Custom Export
                    const srcStr = esSourceString(this)

                    let text = bufferOrText
                    if (!isText) text = new TextDecoder().decode(bufferOrText)

                    const update = !text.includes(srcStr)
                    if (update) {
                        text += srcStr
                        this.info.text.updated = text
                    }

                    if (!isText) this.#buffer = bufferOrText = new TextEncoder().encode(text)
                }
            
            
                // Encode into a datauri and/or objecturl
                const encodings = []
                const output = this.options.output
                if (output?.datauri) encodings.push('datauri')
                if (output?.objecturl) encodings.push('objecturl')
                for (let i in encodings) {
                    const encoding = encodings[i]

                    const encodedInfo = await encode[encoding](bufferOrText, this.url, mimeType)

                    if (encodedInfo) {
                        this.result = encodedInfo.module
                        this.encodings[encoding] = await encodedInfo.encoded
                    }
                }

                const encoded = (this.bundler === 'objecturl') ? this.encodings.objecturl : this.encodings.datauri

                // Updating dependencies
                // const promises = Array.from(this.dependents.values()).map(dep => dep.updateDependency(this, encoded))
                // await Promise.all(promises)

                resolve(encoded)
            } catch (e) {
                reject(e)
            }
        })

        return this.promises.encoded.promise
    }

    delete = () => {
        if (this.objecturl) window.URL.revokeObjectURL(this.objecturl);
    }

    // ------------------- Dependency Management ------------------- //
    addDependency = (o) => {

        let foundCircular = false
        if (this.dependents.has(o.url)) foundCircular = true
        this.dependencies.set(o.url, o)
        if (o.dependencies.has(this.url)) foundCircular = true 
        o.dependents.set(this.url, this)

        // Abort for circular references before waiting
        if(foundCircular) {
            this.circular(o)
            o.circular(this)
        }
    }

    removeDependency = (o) => {
        this.dependencies.delete(o.name)
        o.dependents.delete(this.name)
    }

    updateDependency = async (o, encoding) => {
        const infoArr = this.imports[o.url]
        infoArr.forEach(info => this.updateImport(info, encoding))
    }

    // ------------------- Additional Helpers ------------------- //
    updateCollection = (collection) => {
        if (!collection) {
            this.collection = this.options.collection = Object.keys(globalThis.REMOTEESM_BUNDLES).length
        } else this.collection = collection
    }

    // ------------------- Download Bundle ------------------- //
    download = async (path=this.filename) => {

        if (this.bundler != 'datauri') await this.setBundler('datauri') // ensure that you can download

        // Convert to ObjectURL
        const mime = this.encodings.datauri.split(',')[0].split(':')[1].split(';')[0];
        const binary = atob(this.encodings.datauri.split(',')[1]);
        const array = [];
        for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
        }

        const buffer = new Uint8Array(array)
        const blob = new Blob([buffer], {type: mime});
        const objecturl = URL.createObjectURL(blob)

        // Download to your filesystem
        if (globalThis.REMOTEESM_NODE){
            await polyfills.ready
            globalThis.fs.writeFileSync(path, buffer)
            console.log(`Wrote bundle contents to ${path}`)
        } 
        
        // Download from the browser
        else {

            // Download on the Browser
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = objecturl;
            a.download = path;
            a.click();
        }
    }

    // ------------------- Handle Circular References ------------------- //
    circular = async (o) => {
        this.options._esmpile.circular.add(this.url) // add self

        const result = await this.resolve().catch((e) => {
            console.warn(`Circular dependency detected: Fallback to direct import for ${this.url} failed...`, e)
            const message = `Circular dependency cannot be resolved: ${this.uri} <-> ${o.uri}.`
            throw new Error(message)
        })

        console.warn(`Circular dependency detected: Fallback to direct import for ${this.url} was successful!`, result)
    }

    resolve = async (uri=this.uri) => {

        // resetting resolution variables
        this.status = 'resolving'
        this.result = undefined
        this.encoded = undefined

        // define result promise

        this.result = this.promises.result.promise = new Promise(async (resolve, reject) => {

            this.promises.result.reject = reject
            this.promises.result.resolve = resolve

            let result;

            const isCircular = this.options._esmpile.circular.has(this.url)
            let isDirect = isCircular || !this.derived.compile

            try {

                // ------------------- Direct Import ------------------- 
                result = (isDirect) ? await this.import().catch(async e => {
                    if (this.#options.fallback === false) throw e
                    else await this.setBundler('objecturl') // fallback to objecturl
                }) : undefined // try to import natively

                // -------------------Text Compilation ------------------- 
                try {
                    if (!result) {
                        if (isCircular) throw new Error(`Failed to import ${this.url} natively.`)
                        else result = await this.compile() // fallback to text compilation
                    }
                } 
                
                // Handle Resolution Errors
                catch (e) {

                    if (e) {
                        if (this.options.fetch?.signal?.aborted) throw e

                        // TODO: Can use these as defaults
                        else {
                            const noBase = pathUtils.absolute(uri) ? pathUtils.noBase(uri, this.options, true) : pathUtils.noBase(this.url, this.options, true)
                            console.warn(`Failed to fetch ${uri}. Checking filesystem references...`);
                            const filesystemFallback = this.options.filesystem?._fallbacks?.[noBase];
                            if (filesystemFallback) {
                                console.warn(`Got fallback reference (module only) for ${uri}.`);
                                result = filesystemFallback;
                                throw new Error('Fallbacks are broken...')
                                // Object.defineProperty(info, 'fallback', { value: true, enumerable: false })
                            } else {
                                const middle = "was not resolved locally. You can provide a direct reference to use in";
                                if (e.message.includes(middle)) throw e;
                                else throw errors.create(uri, noBase);
                            }
                        }
                    }
                }

                await this.encoded // ensure properly encoded
                this.status = 'success'
                this.notify(this)

                resolve(result)
            } catch (e) {
                this.status = 'failed'               
                 this.notify(null, e)
                reject(e)
            }
        })

        // Forward promise...
        return this.result
    }

    sources = async () => await sourceMap.get(this.#url, this.#options, this.info.text.original)
}