import { Options } from "../../../../../common/types"
import { specialKeys } from "../../../../../esc/standards"
import { deep as deepClone } from "../../../../../common/clone"

import wasm from './wasm'


const catchError = (o, e) => {
    // Insert an Error Component
    if (o[specialKeys.reference]) {
        console.warn('[escompose]: Falling back to ES Component reference...', e)
        return o[specialKeys.reference] // fallback to reference key
    }
    else return createErrorComponent(e.message)
}

const genericErrorMessage = `Cannot transform ${specialKeys.compose} string without a compose utility function`

export default function compile(o, opts: Options) {
            
    // Special URL key
    let uri = (typeof o === 'string') ? o : o[specialKeys.uri]

    if (uri && uri.slice(-5) === '.wasm') {
        let relTo = o.relativeTo ?? opts?.relativeTo ?? window.location.href
        if (relTo.slice(-1)[0] !== '/') relTo += '/'
        const absoluteURI = new URL(uri, relTo).href
        return new Promise(async (resolve) =>  {
            const info = await wasm(absoluteURI, o.importOptions)
            const copy = Object.assign({}, info.instance.exports) as any
            // WebAssembly Support
            for (let key in copy){
                const val = copy[key]
                if (val instanceof WebAssembly.Memory) copy[key] = new Uint8Array(val.buffer); // Replace Memory with Typed Array
                else if (val instanceof WebAssembly.Global) {
                    Object.defineProperty(copy, key, {
                        get: () => val.value,
                        set: (v) => val.value = v
                    })
                }
            }

            resolve(copy)
        })
    }

    else if (uri && opts.utilities) {

        // Get Text Bundle
        const bundleOpts = opts.utilities.bundle
        const gotBundleOpts = bundleOpts && typeof bundleOpts.function === 'function'
        const compileOpts = opts.utilities.compile
        const gotCompileOpts  = compileOpts && typeof compileOpts.function === 'function'
        
        if (!gotBundleOpts && !gotCompileOpts) o = catchError(o, new Error(genericErrorMessage))
        else {
            return new Promise(async (resolve) => {

                try {

                    if (gotBundleOpts) {
                        const options = bundleOpts.options ?? {}
                        if (!options.bundler) options.bundler = 'datauri' // link as datauri
                        if (!options.bundle) options.collection ='global' // same collection across all instances on the page
                        if (!options.relativeTo) options.relativeTo = opts.relativeTo ?? '.' // Specify relativeTo in different locations
                        const bundle = bundleOpts.function(uri, options)

                        // Track Bundle Resolution
                        await bundle.compile()

                        o = Object.assign({}, bundle.result)
                    } 
                    
                    // Just Compile
                    else if (gotCompileOpts) {
                        const options = compileOpts.options ?? {}
                        if (!options.relativeTo) options.relativeTo = opts.relativeTo ?? '.' // Specify relativeTo in different locations
                        const resolved = await compileOpts.function(o, options)
                        o = resolved
                    } 
                    
                    // Show Error Message
                    else {
                        throw new Error(genericErrorMessage)
                    }
                } catch (e) { 
                    o = catchError(o, e)       
                }

                resolve(deepClone(o))
            })
        }
    }

    return deepClone(o[specialKeys.reference] ?? o) 
}


function createErrorComponent (message) {
    return {
        [specialKeys.element]: 'p',
        b: {
            [specialKeys.element]: 'b',
            [specialKeys.attributes]: {
                innerText: 'Error: '
            }
        },
        span: {
            [specialKeys.element]: 'span',
            [specialKeys.attributes]: {
                innerText: message
            }
        }
    }
}