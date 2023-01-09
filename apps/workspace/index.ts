// import '../../js/benchmarks/index'

// -------------- Import Modules --------------
import * as esc from '../../js/index'

// import ESC from "../../js/escode/src/core/index";
// import validate from "../../js/escode/src/validate/index";
import * as esm from 'esmpile'
// import * as compose from '../../js/escode/src/index'

import * as reference from './index.esc.js'
import { Rule } from '../../js/packages/escode-rules/Rule'

import * as objects from '../../js/demos/objects/index'
import * as graph from '../../js/demos/graph/index'
import { OperationsManager } from '../../js/demos/utils'

import * as basic from '../showcase/demos/basic/index.esc'

const useRule = true

const string = './index.esc.js'

const create = async (config, overrides: any = {}) => {

    overrides = Object.assign({__parent: document.body}, overrides)

    const returned = esc.create(config, overrides, {

        // For Editor Creation + Source Text Loading
        utilities: {
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

    const component = await returned
    await component.__resolved

    console.log('Resolved:', component)

    return component
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

    // Apply ESC to Elements and Components
    const elementArray = document.body.querySelectorAll('button')
    await create(elementArray, {  __attributes: stuff })

    // Apply rule to all Components (only which exist on application though...)
    if (useRule) {
        const rule = new Rule({ __attributes: Object.assign({}, moreStuff)})
        rule.apply()
    } else await create(elementArray, {  __attributes: moreStuff })


    // Compose Components
    const combined = await create({
        first,
        second,
    })

    console.log('Combined:', combined)

    const recombined = await create({ first }) // TODO: Shouldn't this trigger a reparenting (as well as a renaming...)

    console.log('Recombined:', recombined)



    // Create two independent buttons
    const basic1 = await create(basic)
    const basic2 = await create(basic)

    // -------------- Test Suite #1: Core Merge and Listen --------------
   const isStatic = false
   const manager = new OperationsManager()
   manager.set(objects)
   manager.start(isStatic)
   manager.runAll()

    // -------------- Test Suite #2: General Graph Behaviors --------------
   const secondManager = new OperationsManager()
   secondManager.set(graph)
   secondManager.start()
   secondManager.runAll()
}


run()