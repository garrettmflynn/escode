
// -------------- ES Component Imports --------------
import * as test from './libraries/esmpile/tests/basic/index.js'
import * as button from './components/ui/button.js'
import createComponent from './libraries/escompose/src/index'

// -------------- ES Monitor Imports --------------
import { getExecutionInfo } from './libraries/esmonitor/src/listeners.js'
import Monitor from './libraries/esmonitor/src/Monitor.js'
import Inspectable from './libraries/esmonitor/src/inspectable/index.js'

// -------------- ES Code Imports --------------
import ESC from "./libraries/escode/src/core/index";
import validate from "./libraries/escode/src/validate/index";

const app = document.getElementById('app')
const statesDiv = document.getElementById('states')

// Declare Paths
const id = 'test'
const moveButtonId = 'button'

// for (let file in monitor.dependencies) {
//     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
// }

const monitor = new Monitor()


// ------------------ Simple ESMonitor State Object ------------------
const objectStates = {}
monitor.set('states', objectStates)
monitor.on('states', (path, info, update) => {
    console.log('State Object Updated!', path, update)
}, { static: true })

// Monitor ESM
const inspectableState = new Inspectable(objectStates, {
    callback: async (path, info, update) => {
        console.log('Inspected Object Updated!', path, update)
    }
})

// ------------------ Log State ------------------
let states = {}

const add = (arr) => arr.reduce((a, b) => a + b, 0)
const average = (arr) => add(arr) / arr.length


const logUpdate = async (path, info, update) => {

    // ------------------ Set Manually in Inspected State ------------------
    monitor.set(path, update, inspectableState, { create: true })

    // Show state on UI
    if (statesDiv){
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
            if (o.value.performance){
                const tAdded = executionTime - o.value.performance
                state.averages.tAdded.push(tAdded)
            }
            if (executionTime) state.averages.t.push(executionTime)

            state.t.innerHTML = `<span style="font-size: 80%;"><b>Execution Time:</b> ${average(state.averages.t).toFixed(3)}</span>`
            state.tAdded.innerHTML = `<span style="font-size: 80%;"><b>Execution Time Difference:</b> ${average(state.averages.tAdded).toFixed(3)}</span>`
        }


        // Shift Buffers
        for (let key in state.averages){
            if (state.averages[key].length > 100) state.averages[key].shift()
        }

        }
}

// monitor.on(esmId, (path, ...args) => {
//     console.log(esmId, path, ...args)
//     logUpdate(path, ...args)
// })

// ----------------------- Use ESCode -----------------------
const escodeFile = {
    esComponents: {
        [id]: {
            esCompose: test
        }, 
        container: {
            componentToMove: moveButtonId,
            esCompose: {
                tagName: 'div',
                esComponents: {
                    header: {
                        tagName: 'h1',
                        attributes: {
                            innerText: 'ESCompose Demo'
                        }
                    },
                    [moveButtonId]: {
                        esCompose: button,
                        esTrigger: {value: true, __internal: true}
                    },
                }
            },
            parentNode: app
        }
    },
    esListeners: {
        [`container.${moveButtonId}`]: {
            [`${id}.imports`]: true
        },
        [`${id}.imports`]: logUpdate,
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


const component = createComponent(escodeFile, options)
console.log('Configuration Object', component)

// const demos = {
//     "Todo List": {
//         "path": "./drafts/demos/todo/index.esc.json",
//         "img": "./drafts/assets/todo.png"
//     },
//     // "Phaser Demo": {
//     //     "path": "./drafts/demos/phaser/index.esc.json",
//     //     "img": "./drafts/assets/phaser.png"
//     // },
//     "Phaser - Multiplayer": {
//         "path": "./drafts/demos/phaser/versions/multiplayer.esc.json",
//         "img": "./drafts/assets/phaser-multiplayer.png"
//     },
//     "HEG": {
//         "path": "./drafts/demos/devices/audiofeedback/index.esc.json",
//         "img": "./drafts/assets/heg.png"
//     },
//     "EEG": {
//         "path": "./drafts/demos/devices/eegnfb/index.esc.json",
//         "img": "./drafts/assets/eeg.png"
//     }
// };

// const demoContainer = document.getElementById('demos')
// const backButton = document.getElementById('backButton')
// const demo = document.getElementById('demo')

// const appName = document.getElementById('appname')

// const loader = document.getElementById('loader').children[0].children[0]
// const nGraphs = document.getElementById('nGraphs')
// const progress = document.getElementById('progress')

// for (let name in demos) {
//     const o = demos[name]
//     const div = document.createElement('div');
//     demoContainer.appendChild(div)
//     if (o.img){
//         div.style.backgroundImage = `linear-gradient(rgba(0,0,0,.40), rgba(0,0,0,.40)), url(${o.img})`
//         div.style.color = 'white'
//     }
//     div.innerHTML = `<h3>${name}</h3>`;
//     div.onclick = async () => {
//         demoContainer.style.display = 'none'
//         progress.style.opacity = 1
//         demo.style.display = 'block'
//         setTimeout(() => {
//             backButton.style.display = 'block'
//             appName.innerHTML = name
//         }, 100)
//         await loadDemo(o);
//     };
// }

// const loadDemo = async (info) => {

//     const options = {
//         relativeTo: import.meta.url, // allows you to resolve the project,
//         nodeModules: 'node_modules',
//         filesystem: {
//             _fallbacks: {
//                 'browserfs': window.BrowserFS,
//             }
//         },
//         callbacks: {
//             progress: {
//                 source: (label, i, total) => {
//                     const ratio = (i / total)
//                     loader.style.width = `${ratio * 100}%`
//                     if (ratio === 1) setTimeout(() => progress.style.opacity = 0, 100)
//                 },
//                 components: (label, i, graph) => {
//                     nGraphs.innerHTML = i
//                 },
//                 fetch: (label, i, total) => {
//                     console.log('Fetch', label, i, total)
//                 },
//             }
//         }
//     }

//     options.parentNode = document.getElementById('container') 
//     options.activate = true // use internal graph system
//     options.debug = true
//     options.errors = []
//     options.warnings = []

//     // ------------------- Import Mode -------------------
//     const schemaValid = await validate(info.path, options)
//     if (schemaValid) {
//         let esc = new ESC(info.path, options)
//          await esc.init()
//          const loadValid = await validate(esc, options)
//          if (loadValid) {
//             await esc.start()
//             console.log('ESC', esc)
//             backButton.onclick = () => reset(esc)
//          } else console.error('Invalid Loaded ESC Object')
//     } else console.error('Invalid ESC Schema')

//     printError(options.errors, 'import')
//     printError(options.warnings, 'import', "Warning")
// }

// function printError(arr, type, severity='Error'){
//     arr.forEach(e => {
//         const log = (severity === 'Warning') ? console.warn : console.error
//         log(`${severity} (${type})`, e)
//     })
// }

// function reset(esc) {
//     if (esc) esc.stop()
//     demoContainer.style.display = ''
//     backButton.style.display = ''
//     progress.style.opacity = 0
//     appName.innerHTML = ''
//     demo.style.display = ''
//     loader.style.width = `0%`
// }