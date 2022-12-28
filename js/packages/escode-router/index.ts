import * as esc from '../../index'


type Options = {
    spa: boolean,
    element: {
        root: HTMLElement | string
        target?: HTMLElement | string
    },
}

type InputOptions = {
    spa?: boolean,
    element?: HTMLElement | string | Options['element'],
}

const scrollToComponent = (path) => {
    const el = document.getElementById(path)

    if (el) el.scrollIntoView({ 
        // behavior: 'smooth' 
    })
    else console.error(`No component found for path: ${path}`)
}


let DOMContentLoaded = false
class Router {

    options: Options

    loaded?: {
        path: string,
        ref: any
    }

    root?: any;

    paths: {[key: string]: any} = {}

    constructor(options: InputOptions){

        options = Object.assign({}, options) // copy
        if (!options.element) options.element = { root: document.body }

        if (typeof options.element !== 'object' || !('root' in options.element)) {
            options.element = { root: options.element }
        }

        this.options = options as Options;

        window.addEventListener('beforeunload', (ev) => this.load(undefined, ev))

        window.addEventListener('popstate', (ev) =>  this.load(undefined, ev))
        window.addEventListener('DOMContentLoaded', (ev) => {
            DOMContentLoaded = true
            if (!this.loaded || this.loaded.path === '') this.load(undefined, ev) 
        });
    }

    set = (path, esc) => {
        if (esc === undefined) delete this.paths[path]
        else this.paths[path] = esc
    }

    setRoot = (esc) => this.set('', esc)  

    get = (path=this.getPath()) => {
        let target = this.paths;
        path.split(/\.|\//).forEach((key) => target = target[key] ?? target[''][key]) // Grab from root if missing
        return target
    }

    load = (path?: string, ev?: Event, fallback: boolean = true) => {

        let resolvedPath = ((path === undefined) ? this.getPath() : path) as string

        let target = this.get(resolvedPath)

        if (target && ev) ev.preventDefault();

        const useFallback = 
        !target 
        && (!this.loaded  || this.loaded.path !== '')
         && fallback

        // console.warn('Pass', resolvedPath, target, useFallback, this.loaded)
        if (useFallback) {
            resolvedPath = ''
            target = this.get('') // Fallback to root
        }

        if (target) {

            let __parent = this.options.element.root
            const parentTarget = resolvedPath ? this.options.element.target : undefined // Use target if not root

            if (parentTarget) {

                if (!this.loaded || (this.loaded.path !== '' && resolvedPath !== '')) this.load('') // Ensure the root is loaded

                if (typeof parentTarget === 'string') __parent = document.querySelector(parentTarget) as HTMLElement
                else __parent = parentTarget

                const arr = [...__parent.children]
                if (__parent) {
                    for (const child of arr) child.remove()
                }

            } 
            
            else if (this.loaded) this.loaded.ref.__element.remove()  // Remove old component

            const config = esc.clone(target)

            const component = esc.create(config, {__parent})

            // Transfer Roots
            if (resolvedPath === '') {
                if (this.root) this.root.__element.remove()  // Remove old component
                this.root = component
            }

            // Register Latest Loaded Component
            this.loaded = {
                path: resolvedPath,
                ref: component
            }


            if (parentTarget) window.scrollTo(0,0) // Scroll to top

            return this.loaded

        }
        
        else scrollToComponent(resolvedPath)// Native focusing behavior

        if (useFallback) this.navigate(undefined, undefined, false) // try again
    }

    navigate = (path=this.getPath(), ev?: Event, fallback: boolean = false) => {
        const urlPath = path.split(/\.|\//).join(this.options.spa ? '/' : '.');
        history.pushState({}, 'escodeRouterURL', this.options.spa ? `${window.location.origin}/${urlPath}` : `${window.location.origin}#${urlPath}`);
        this.load(urlPath, ev, fallback);
    }

    getPath = (path?) => {

        if (path === undefined){
            
            if (this.options.spa) path = window.location.pathname.slice(1)
            
            // Fallback to query string
            if (!path) path = window.location.hash.slice(1);
        }

        return path ?? '' // Path or root
    }

}



export default Router