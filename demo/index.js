
import * as button from '../components/ui/button.js'
import * as container from './components/container.js'
import createComponent from '../libraries/escompose/src/index'
import * as test from '../libraries/esmpile/tests/basic/index.js'

const app = document.getElementById('app')
const statesDiv = document.getElementById('states')

const removeButton = Object.assign({}, button)
removeButton.attributes = Object.assign({}, removeButton.attributes)
removeButton.attributes.innerHTML = 'Remove Listeners'

// Declare Paths
const id = 'test'
const moveButtonId = 'button'

// for (let file in monitor.dependencies) {
//     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
// }

// ------------------ Log State ------------------
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


const options = {
    onInit: logUpdate,
    onListen: logUpdate,
    monitor: {
        pathFormat: 'absolute',
        polling: {
            sps: 60
        }
    }
}

const component = createComponent(wasl, options)
console.log('WASL', component)

