
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'

import * as reference from './index.esc.js'
const source = './index.esc.js'

const create = async (config, toApply: any = {}) => {

    toApply = Object.assign({__parent: document.body}, toApply)

    const component = escompose.create(config, toApply, {

        await: true,

        // For Editor Creation + Source Text Loading
        utilities: {
            code: {
                class: escode.Editor,
                options: {}
            },
            bundle: {
                function: esm.bundle.get,
                options: {
                    // nodeModules,
                    // filesystem
                }
            },
            // compile: {
            //     function: esm.compile,
            //     options: {
            //         relativeTo,
            //         nodeModules,
            //         // filesystem
            //     }
            // }
        }
    })


    const esc = await component // Promise for self is resolved
    await esc.__connected // All children promises are resolved (if await is false)

    console.log('ESC', esc)
}



const run = async () => {
    // await create(source) // Load from source
    await create(reference) // Luanch from reference
}   


run()