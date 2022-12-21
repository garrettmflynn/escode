
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'

import * as reference from './index.esc.js'
import { Rule } from '../../libraries/drafts/rules/Rule'
import { isProxy } from '../../libraries/esmonitor/src/globals'




const useRule = true

const string = './index.esc.js'

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


    const esc = await component
    await component.__resolved

    console.log('Created:', esc)
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
    await create(string)

    // Create ESC from reference
    await create(reference)

    // Apply ESC to Elements and Components
    const elementArray = document.body.querySelectorAll('button')
    await create(elementArray, {  __attributes: stuff })

    // Apply rule to all Components (only which exist on application though...)
    if (useRule) {
        const rule = new Rule({ __attributes: Object.assign({}, moreStuff)})
        rule.apply()
    } else await create(elementArray, {  __attributes: moreStuff })


    // -------------- Lesson #2: Any Object Can Participate (`listen` and `merge`) --------------
    const objectOne = {
        test: 1, 
        active: false,
        testFunction: () => {
            return 'Hi!'
        }
    }

    const o2TestFunction = () => {
        return 'Failed!'
    }

    const objectTwo = {
        test: 2, 
        active: true, 
        success: false,
        testFunction: o2TestFunction // Function merge
    }

    const o3TestFunction = () => {
        return 'Succeeded!'
    }

    o3TestFunction.__compose = true

    const objectThree = {
        test: 3, 
        active: true, 
        success: true,
        testFunction: o3TestFunction // Function merge
    }


    const isStatic = false
     // Use listen for listening to an object
     const proxy = escompose.monitor.set(
        'objectOne', 
        objectOne, 
        { 
            static: isStatic
        }
    )

     escompose.monitor.on('objectOne', (path, _, update) => {
        console.log('Changed!', path, update)
     })

     console.log('------------- Trying test function -------------')
     await objectOne.testFunction()


    // Use merge for merging objects
    console.log('------------- Starting failed merge -------------')
    escompose.merge([objectOne, objectTwo], true)
    await objectOne.testFunction()

    console.log('------------- Starting successful merge -------------')
    escompose.merge([proxy, objectThree], true)
    await proxy.testFunction()
}   


run()