
import * as button from '../components/ui/button.js'
import * as container from './components/container.js'
import createComponent from '../libraries/escompose/src/index'
import * as test from '../libraries/esmpile/tests/basic/index.js'
import { getExecutionInfo } from '../libraries/esmonitor/src/listeners.js'

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
let states = {}

const add = (arr) => arr.reduce((a, b) => a + b, 0)
const average = (arr) => add(arr) / arr.length

const logUpdate = async (path, info, update) => {

    let tAdded = undefined

    let state = states[path]
    if(!state) {
        state = states[path] = {}
        state.div = document.createElement('div')
        state.t = document.createElement('p')
        state.tAdded = document.createElement('p')
        state.value = document.createElement('p')
        state.averages = {
            t: [],
            tAdded: []
        }
        state.div.appendChild(state.value)
        state.div.appendChild(state.t)
        state.div.appendChild(state.tAdded)

        statesDiv.appendChild(state.div)
    }

    state.value.innerHTML = `<h4>${path}</h4> ${JSON.stringify(update)}`


    const active = info.function && info.arguments && info.info
    const o  = (active) ? await getExecutionInfo(info.function, info.arguments, info.info) : {output: update, value: {}}

    if (info.hasOwnProperty('performance')) {
        const executionTime = info.performance
        tAdded = executionTime - o.value.performance
        if (tAdded) state.averages.tAdded.push(tAdded)
        if (executionTime) state.averages.t.push(executionTime)

        state.t.innerHTML = `<span style="font-size: 80%;"><b>Execution Time:</b> ${average(state.averages.t).toFixed(3)}</span>`
        state.tAdded.innerHTML = `<span style="font-size: 80%;"><b>Execution Time Difference:</b> ${average(state.averages.tAdded).toFixed(3)}</span>`
    }


    // Shift Buffers
    for (let key in state.averages){
        if (state.averages[key].length > 100) state.averages[key].shift()
    }

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
    onUpdate: {
        callback: logUpdate,
        info: {
            performance: true
        }
    },
    monitor: {
        pathFormat: 'absolute',
        polling: {
            sps: 60
        }
    }
}

const component = createComponent(wasl, options)
console.log('WASL', component)

