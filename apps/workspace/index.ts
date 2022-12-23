
// import '../../libraries/escompose/demos/graph/benchmark'

// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'

// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'

import * as reference from './index.esc.js'
import { Rule } from '../../libraries/drafts/rules/Rule'

import * as objects from 'escompose/demos/objects/index'
import * as graph from 'escompose/demos/graph/index'
import { OperationsManager } from 'escompose/demos/utils'


const useRule = true

const string = './index.esc.js'

const create = async (config, toApply: any = {}) => {

    toApply = Object.assign({__parent: document.body}, toApply)

    const component = escompose.create(config, toApply, {

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

    const esc = await component
    await component.__resolved

    console.log('Resolved:', esc)

    return esc
}


const stuff = {
    innerHTML: 'Updated Text',
    onclick: function () {
        console.log('Worrked1')
    }
}

const moreStuff = {
    innerHTML: 'Updated Text Again',
    onclick: function () {
        this.__element.style.backgroundColor = 'red'
    }
}

const run = async () => {

    // Create ESC from string
    const first = await create(string)

    // Create ESC from reference
    const second = await create(reference)

    const combined = await create({
        first,
        second,
    })

    console.log('Combined:', combined)

    const recombined = await create({ first }) // TODO: Shouldn't this trigger a reparenting (as well as a renaming...)


    console.log('Recombined:', recombined)


    // Apply ESC to Elements and Components
    const elementArray = document.body.querySelectorAll('button')
    await create(elementArray, {  __attributes: stuff })

    // Apply rule to all Components (only which exist on application though...)
    if (useRule) {
        const rule = new Rule({ __attributes: Object.assign({}, moreStuff)})
        rule.apply()
    } else await create(elementArray, {  __attributes: moreStuff })

    // -------------- Test Suite #1: Core Merge and Listen --------------
   const isStatic = false
   const manager = new OperationsManager()
   manager.set(objects)
   manager.start(isStatic)
   manager.runAll()

   const secondManager = new OperationsManager()
   secondManager.set(graph)
   secondManager.start()
   secondManager.runAll()
}   

window.onkeypress = () => {
    console.log(`---------------- results ----------------`)
    const results = globalThis.escomposePerformance.averages()
    for (let key in results) {
        const val = results[key]
        if (typeof val !== 'object') console.log('Result', key, val)
        else {
            for (let k in val) console.log('Result', key, k, val[k])
        }
    }
}



run()