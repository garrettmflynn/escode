import safeImport from "./node_modules/remote-esm/index.js"

const isSame = (a,b) => {
    if (a && typeof a === 'object') {
        const jA = JSON.stringify(a)
        const jB = JSON.stringify(b)
        return jA === jB
    } else return a === b
}


export default class ESMonitor {

    dependencies = {}
    subscriptions = {}
    references = {}
    datauri = {}

    timeBetweenUpdates = 1000/60

    constructor(opts={}){

        // Monitor Subscriptions for Changes
        let check = () => {
            for(let sym of Object.getOwnPropertySymbols(this.subscriptions) ) {
                let {f, accessor, history, internal, path, last} = this.subscriptions[sym]
                const ref = accessor()
                if (!isSame(ref,history)){
                    if (internal) {
                        let ogO = {}
                        let o = ogO
                        path.slice(0, -1).forEach(str => o = o[str])
                        o[last] = ref
                        f(ogO)
                    } else f(ref)
                    this.subscriptions[sym].history = (typeof ref === 'object') ? Object.assign({}, ref) : ref
                }
            }
            setTimeout(check, this.timeBetweenUpdates)
        }

        if (opts.timeBetweenUpdates) this.timeBetweenUpdates = opts.timeBetweenUpdates

        check()
    }

    import = (uri, opts={}) => {
        opts.dependencies = this.dependencies
        opts.datauri = this.datauri
        opts.forceImportFromText = true // ensures dependencies are monitored
        return safeImport(uri, opts)
    }

    subscribe = async (name, f, path, all) => {

        if (!this.references[name]) this.references[name] = await import(this.datauri[name])

        let internal = Array.isArray(path)

        // Drill Reference based on Path
        let accessor = () => {
            let ref =  this.references[name]
            if (internal) { 
                path.forEach(str => {
                    if (str in ref) ref = ref[str]
                    else throw new Error(`Invalid path: ${path}`, this.references[name])
                })
            }
            return ref
         }

        // Create Subscriptions for Objects
        let ref = accessor()

        if (ref && typeof ref === 'object' && all === true) {
            let subs = []
            for (let key in ref) subs.push(this.subscribe(name, f, [...path, key], true)) // subscribe to all
            return subs
        }

        // Create Subscription
        else {
            let sub = Symbol('subscription')
            this.subscriptions[sub] = {name, f, accessor, internal, path, last: path.slice(-1)[0], history: (typeof ref === 'object') ? Object.assign({}, ref) : ref}
            return sub
        }

    }

    unsubscribe = (sub) => {
        delete this.subscriptions[sub]
        return true
    }
}