
import create from '../libraries/escompose/src/create/index'
import * as button from '../components/ui/button.js'

import Monitor from '../libraries/esmonitor/index'
import * as test from '../libraries/esmpile/tests/basic/index.js'


const section = document.querySelector('section')

// ------------------ Basic Component Execution ------------------
const movingButton = create('button', button)


const copy = Object.assign({}, button)
copy.attributes = Object.assign({}, copy.attributes)
copy.attributes.innerHTML = 'Remove Listeners'
const removeButton = create('remove', copy)

let counter = 0
const createContainer = () => {
    const container = create(`container${counter}`, {
        tagName: 'div',
        attributes: {
            innerHTML: `Click Me to Reparent Button`,
            onclick: () => {
                movingButton.parentNode = container
            }
        }
    })

    counter++
    return container
}
const container1 = createContainer()
const container2 = createContainer()
const container3 = createContainer()


container1.parentNode = section
container2.parentNode = section
container3.parentNode = section
removeButton.parentNode = section

movingButton.parentNode = container1

// ------------------ Basic Component Link ------------------

// ------------------ Manual ESM Monitoring ------------------

const monitor = new Monitor({
    polling: {
        sps: 60
    }
})

// Subscribe to All Changes

const callback = (id, path, update) => {
    const p = document.createElement('p')
    p.innerHTML = `<b>${id}.${path}:</b> ${JSON.stringify(update)}`
    section.appendChild(p)
}

const id = 'test'
const testSubs = monitor.listen(id, (...args) => {
    callback(id, ...args)
}, {
    reference: test, 
    // path: ['imports', 'nExecution'],
})
// for (let file in monitor.dependencies) {
//     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
// }

// ------------------ Subscribe to Button Click ------------------
const buttonSubs = monitor.listen(movingButton.instance.id, (...args) => {
    if (args[0] === 'attributes.onmousedown') test.imports.default() // Run test when button is clicked
    callback(movingButton.instance.id, ...args)
}, {
    reference: movingButton.instance, 
    path: ['attributes', 'onmousedown'],
})

const objectId = 'object'
const object = {
    test: true
}
const objectSubs = monitor.listen(objectId, (...args) => {
    callback(objectId, ...args)
}, {
    reference: object, 
})

object.test = false


const removeSubs = monitor.listen(removeButton.instance.id, (...args) => {
    if (args[0] === 'attributes.onmousedown') {
        monitor.stop(testSubs)
        monitor.stop(buttonSubs)
        monitor.stop(objectSubs)
        monitor.stop(removeSubs)
        object.test = true
    }
    callback(removeButton.instance.id, ...args)
}, {
    reference: removeButton.instance, 
    path: ['attributes', 'onmousedown'],
})




