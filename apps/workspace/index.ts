
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'

import * as reference from './index.esc.js'
import { Rule } from '../../libraries/drafts/rules/Rule'
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


    const esc = await component // Promise for self is resolved
    await esc.__connected // All children promises are resolved (if await is false)

    console.log('ESC', esc)
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


    await create(elementArray, {  __attributes: moreStuff })

    // Apply rule to all Components (only which exist on application though...)
    const rule = new Rule({ __attributes: Object.assign({}, moreStuff)})
    rule.apply()


    // -------------- Lesson #2: Any Object Can Participate (`listen` and `merge`) --------------
    const objectOne = {
        test: 1, 
        active: false,
        testFunction: () => {
            const message = 'Hi!'
            console.log(message)
            return message
        }
    }

    const o2TestFunction = () => {
        const message = 'Failed!'
        console.log(message)
        return message
    }

    const objectTwo = {
        test: 2, 
        active: true, 
        success: false,
        testFunction: o2TestFunction // Function merge
    }


    const o3TestFunction = () => {
        const message = 'Succeeded!'
        console.log(message)
        return message
    }

    o3TestFunction.__compose = true

    const objectThree = {
        test: 3, 
        active: true, 
        success: true,
        testFunction: o3TestFunction // Function merge
    }

     // Use listen for listening to an object
     const objectOneProxy = escompose.monitor.set(
        'objectOne', 
        objectOne, 
        {static: true}
    )
     escompose.monitor.on('objectOne', (path, _, update) => {
        console.log('Changed!', path, update)
     })

     console.log('------------- Trying test function -------------')
     await objectOne.testFunction()


    // Use merge for merging objects
    console.log('------------- Starting failed merge -------------')
    const failedToListenToNewKey = escompose.merge([objectOne, objectTwo], true)
    // objectOne.testFunction = o2TestFunction // Direct replacement
    await objectOne.testFunction()
    console.log('Failed to Listener to New Key', failedToListenToNewKey)

    console.log('------------- Starting successful merge -------------')
    const listenedToNewKey = escompose.merge([objectOneProxy, objectThree], true)
    // objectOneProxy.testFunction = o3TestFunction // Direct replacement
    await objectOneProxy.testFunction()

    console.log('Merged + All Listeners Worked!', listenedToNewKey)

    console.log(objectOneProxy, objectOne)
    console.log(objectOneProxy.test, objectOne.test)
    console.log(objectOneProxy.active, objectOne.active)
    console.log(objectOneProxy.success, objectOne.success)



}   


run()