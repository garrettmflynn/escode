
import create from '../libraries/escompose/src/create/index'
import * as button from './components/button.js'
import * as container from './components/container.js'

import Monitor from '../libraries/esmonitor/src/index'
import * as test from '../libraries/esmpile/tests/basic/index.js'

const app = document.getElementById('app')
const statesDiv = document.getElementById('states')

const removeButton = Object.assign({}, button)
removeButton.attributes = Object.assign({}, removeButton.attributes)
removeButton.attributes.innerHTML = 'Remove Listeners'

const monitor = new Monitor({
    pathFormat: 'absolute',
    polling: {
        sps: 60
    }
})

// Declare Paths
const id = 'test'
const esmId = 'testESM'
const moveButtonId = 'button'

// for (let file in monitor.dependencies) {
//     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
// }

// Monitor Raw ESM
monitor.set(esmId, test)

let paragraphs = {}
const logUpdate = (path, update) => {
    let p = paragraphs[path]
    if(!p) {
        p = paragraphs[path] = document.createElement('p')
        statesDiv.appendChild(p)
    }
    p.innerHTML = `<b>${path}:</b> ${JSON.stringify(update)}`
}

// monitor.on(esmId, (path, ...args) => {
//     console.log(esmId, path, ...args)
//     logUpdate(path, ...args)
// })

// Replicate in a WASL Tree
const wasl = {
    components: {
        [id]: {
            esSrc: test
        }, 
        ['container1']: {
            componentToMove: moveButtonId,
            esSrc: container,
            parentNode: app
        },
        ['container2']: {
            componentToMove: moveButtonId,
            esSrc: container,
            parentNode: app
        },
        ['container3']: {
            componentToMove: moveButtonId,
            esSrc: container,
            parentNode: app
        },
        [moveButtonId]: {
            esSrc: button,
            parentNode: 'container1'
        },
    },
    listeners: {
        [`${moveButtonId}.attributes.onmousedown`]: {
            [`${id}.imports`]: true
        },
    }
}

for (let name in wasl.components) {

    // Instance the Component
    const copy = Object.assign({}, wasl.components[name])
    const esSrc = copy.esSrc
    delete copy.esSrc
    const merged = Object.assign(Object.assign({}, esSrc), copy)
    const instance = create(name, merged)
    monitor.set(name, instance)
    wasl.components[name] = instance

    // monitor.on(name, logUpdate) // TODO: Fix infinite loop
}


const onOutput = (name, ...args) => {

    logUpdate(name, ...args)

    for (let key in wasl.listeners[name]) {

        let target = wasl.listeners[name][key]
        const type = typeof target
        const noDefault = type !== 'function' && !target?.default

        // ------------------ Grab Correct Target to Listen To ------------------
        // Get From Passed String
        if (type === 'string') target = wasl.listeners[name][key] = wasl.components[listening]
        
        // Get From Listener Key 
        else if (noDefault) {
            // const options = listening
            const path = key.split('.')
            target = wasl.components
            path.forEach(str => target = target[str])
        }

        // ------------------ Handle Target ------------------
        // Direct Object with Default Function
        if (target?.default) target.default(...args)

        // Direct Function
        else if (typeof target === 'function') target(...args)

        else console.log('Unsupported listener...', target)
    }
}

for (let path in wasl.listeners) {

    // Assign Top-Level Listeners
    monitor.on(path, onOutput)

    // Always Subscribe to Default
    const id = path.split('.')[0]
    const defaultPath = `${id}.default`
    monitor.on(`${id}.default`, onOutput)

    logUpdate(path, undefined)
    logUpdate(defaultPath, undefined)
}

const component = create('wasl', wasl)
console.log('WASL', component)

