import { Options } from "../../../../common/types"
import { specialKeys } from "../../../../esc/standards"
import { deep as deepClone } from "../../../../common/clone"


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

    if (uri && opts.utilities) {

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
                        const bundle = bundleOpts.function(uri, options)

                        // Track Bundle Resolution
                        await bundle.compile()

                        o = Object.assign({}, bundle.result)
                    } 
                    
                    // Just Compile
                    else if (gotCompileOpts) {
                        const resolved = await compileOpts.function(o, compileOpts.options)
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

    return deepClone(o) 
}


function createErrorComponent (message) {
    return {
        [specialKeys.element]: 'p',
        [specialKeys.hierarchy]: {
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
}