
// -------------- Import Modules --------------
import createComponent from '../../libraries/escompose/src/index'
import Monitor from '../../libraries/esmonitor/src/Monitor.js'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";

// ------------------ ES Components (more imports in files) ------------------
import * as escFile from './index.esc'
import * as phaserFile from './demos/phaser/index.esc'
import * as audiofeedbackFile from './demos/devices/audiofeedback/index.esc'
import * as todoFile from './demos/todo/index.esc'
import * as multiplayerPhaserFile from './demos/phaser/versions/multiplayer.esc'
import * as devicePhaserFile from './demos/phaser/versions/devices.esc'
import * as tutorialFile from './demos/tutorial/index.esc'
import * as animationsFile from './demos/animations/index.esc'
import * as accessifyFile from './demos/accessify/index.esc'

import * as test from '../../components/tests/basic/index.js'

// ------------------ ESMpile (todo) ------------------
// for (let file in monitor.dependencies) {
//     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
// }

const main = document.getElementById('app') as HTMLElement

// ------------------ ESMonitor ------------------
// let logUpdate = (path, info, newVal?: any) =>  console.log('Update:', path, info, newVal)

const monitor = new Monitor({
    // onInit: logUpdate,
    // onUpdate: {
    //     callback: logUpdate,
    //     info: {
    //         performance: true
    //     }
    // },
    pathFormat: 'absolute',
    polling: { sps: 60 }
})

// Poll the ESM Object

// ------------------ ESCompose ------------------
const demo: string = 'accessify'
let selected;
if (demo === 'phaser') selected = phaserFile as any
else if (demo === 'multiplayer') selected = multiplayerPhaserFile as any
else if (demo === 'device') selected = devicePhaserFile as any // BROKEN
else if (demo === 'todo') selected = todoFile as any
else if (demo === 'animations') selected = animationsFile as any
else if (demo === 'tutorial') selected = tutorialFile as any
else if (demo === 'accessify') selected = accessifyFile as any

// Broken
else if (demo === 'audiofeedback') selected = audiofeedbackFile as any

// Basic
else {
    selected = escFile as any
    const esmId = 'ESM'
    monitor.set(esmId, test)
    monitor.on(esmId, (path, _, update) =>  console.log('Polling Result:', path, update))
}

selected.esParent = main

// Create an active ES Component from a .esc file
const component = createComponent(selected, {
    monitor, // Use the existing monitor
    // listeners: { static: false } // Will be able to track new keys added to the object
    listeners: { static: true }
})

// // Ensuring there is a container for the app
// component.esElement = document.createElement('div')
// ui.main.appendChild(component.esElement)


// ------------------ ESCode (todo) ------------------
// ....

// ------------------ ESComposer (todo) ------------------
// ....


// ------------------ OLD CODE FOR COMPONENT DEMO ------------------
// const demos = {
//     "Todo List": {
//         "path": "./demos/todo/index.esc.json",
//         "img": "./assets/todo.png"
//     },
//     // "Phaser Demo": {
//     //     "path": "./demos/phaser/index.esc.json",
//     //     "img": "./assets/phaser.png"
//     // },
//     "Phaser - Multiplayer": {
//         "path": "./demos/phaser/versions/multiplayer.esc.json",
//         "img": "./assets/phaser-multiplayer.png"
//     },
//     "HEG": {
//         "path": "./demos/devices/audiofeedback/index.esc.json",
//         "img": "./assets/heg.png"
//     },
//     "EEG": {
//         "path": "./demos/devices/eegnfb/index.esc.json",
//         "img": "./assets/eeg.png"
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

