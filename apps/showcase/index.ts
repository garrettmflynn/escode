
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
import Monitor from '../../libraries/esmonitor/src/Monitor.js'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'


// Basic ESC Demo
import * as escFile from './demos/basic/index.esc'
import * as escFallbacks from './demos/basic/fallbacks'
const escJSON = './/demos/basic/index.esc.json'
const escJS = './demos/basic/index.esc.ts'

// Phaser Demo
import * as phaserFile from './demos/phaser/index.esc'
import phaserFallbacks from './demos/phaser/versions/devices/fallbacks'
const phaserJSON = './demos/phaser/index.esc.json'
const phaserJS = './demos/phaser/index.esc.ts'

// Animations Demo
import * as animationsFile from './demos/animations/index.esc'
import animationsFallbacks from './demos/animations/fallbacks'
const animationsJSON = './demos/animations/index.esc.json'
const animationsJS = './demos/animations/index.esc.ts'

// Multiplayer Phaser Demo
import * as multiplayerPhaserFile from './demos/phaser/versions/multiplayer/index.esc'
import multiplayerPhaserFallbacks from './demos/phaser/versions/multiplayer/fallbacks'
const multiplayerPhaserJSON = './demos/phaser/versions/multiplayer/index.esc.json'
const multiplayerPhaserJS = './demos/phaser/versions/multiplayer/index.esc.ts'

// Speak Phaser Demo
import * as speakPhaserFile from './demos/phaser/versions/speak/index.esc'
import speakPhaserFallbacks from './demos/phaser/versions/speak/fallbacks'
const speakPhaserJSON = './demos/phaser/versions/speak/index.esc.json'
const speakPhaserJS = './demos/phaser/versions/speak/index.esc.ts'


// Device Phaser Demo
import * as devicePhaserFile from './demos/phaser/versions/devices/index.esc'
import devicePhaserFallbacks from './demos/phaser/versions/devices/fallbacks'
const devicePhaserJSON = './demos/phaser/versions/devices/index.esc.json'
const devicePhaserJS = './demos/phaser/versions/devices/index.esc.ts'

// Todo Demo
import * as todoFile from './demos/todo/index.esc'
import todoFallbacks from './demos/todo/fallbacks'
const todoJSON = './demos/todo/index.esc.json'
const todoJS = './demos/todo/index.esc.ts'

// Accessify Demo
import * as accessifyFile from './demos/accessify/index.esc'
import accessifyFallbacks from './demos/accessify/fallbacks'
const accessifyJSON = './demos/accessify/index.esc.json'
const accessifyJS = './demos/accessify/index.esc.ts'

// Tutorial Demo
import * as tutorialFile from './demos/tutorial/index.esc'
import tutorialFallbacks from './demos/tutorial/fallbacks'
const tutorialJSON = './demos/tutorial/index.esc.json'
const tutorialJS = './demos/tutorial/index.esc.ts'

// Signal Demo
import * as signalFile from './demos/signal/index.esc'
import signalFallbacks from './demos/signal/fallbacks'
const signalJSON = './demos/signal/index.esc.json'
const signalJS = './demos/signal/index.esc.ts'

// Noise Demo
import * as noisySignalFile from './demos/signal/versions/noisy/index.esc'
import noisySignalFallbacks from './demos/signal/versions/noisy/fallbacks'
const noisySignalJSON = './demos/signal/versions/noisyindex.esc.json'
const noisySignalJS = './demos/signal/versions/noisy/index.esc.ts'

// // Broken
// else if (demo === 'audiofeedback') selected = audiofeedbackFile as string
// const audiofeedbackJSON = './demos/devices/audiofeedback/index.esc.ts'



// ------------------ ES Components (more imports in files) ------------------

const basicPackage = {
    name: 'Basic',
    file: escFile,
    fallbacks: escFallbacks,
    json: escJSON,
    js: escJS
}

const phaserPackage = {
    name: 'Game',
    file: phaserFile,
    fallbacks: phaserFallbacks,
    json: phaserJSON,
    js: phaserJS

}

const animationsPackage = {
    name: 'Animations',
    json: animationsJSON,
    fallbacks: animationsFallbacks,
    file: animationsFile,
    js: animationsJS

}

const todoPackage = {
    name: 'Todo',
    json: todoJSON,
    fallbacks: todoFallbacks,
    file: todoFile,
    js: todoJS
}

const multiplayerPackage = {
    name: 'Multiplayer Game',
    json: multiplayerPhaserJSON,
    fallbacks: multiplayerPhaserFallbacks,
    file: multiplayerPhaserFile,
    js: multiplayerPhaserJS
}

const speakPackage = {
    name: 'Voice Controlled Game',
    json: speakPhaserJSON,
    fallbacks: speakPhaserFallbacks,
    file: speakPhaserFile,
    js: speakPhaserJS
}

const devicePackage = {
    name: 'EMG-Controlled Game',
    json: devicePhaserJSON,
    fallbacks: devicePhaserFallbacks,
    file: devicePhaserFile,
    js: devicePhaserJS
}

const tutorialPackage = {
    name: 'ESCode Tutorial',
    json: tutorialJSON,
    fallbacks: tutorialFallbacks,
    file: tutorialFile,
    js: tutorialJS
}

const accessifyPackage = {
    name: 'Accessify',
    json: accessifyJSON,
    fallbacks: accessifyFallbacks,
    file: accessifyFile,
    js: accessifyJS
}

const signalPackage = {
    name: 'Signal',
    json: signalJSON,
    fallbacks: signalFallbacks,
    file: signalFile,
    js: signalJS
}

const noisySignalPackage = {
    name: 'Noisy Signal',
    json: noisySignalJSON,
    fallbacks: noisySignalFallbacks,
    file: noisySignalFile,
    js: noisySignalJS
}

const demos = {

    // Complete Walkthrough
    tutorial: tutorialPackage,

    // Basic ESC Demos
    basic: basicPackage,
    animations: animationsPackage,
    todo: todoPackage,
    phaser: phaserPackage,
    multiplayer: multiplayerPackage,
    speak: speakPackage,

    // Physiological Demos
    signal: signalPackage,
    noisy: noisySignalPackage,
    device: devicePackage,

    // Complete Applications
    accessify: accessifyPackage
}

const modes = {
    'Direct': 'direct',
    ['File Compilation']: 'compilation',
    'JSON': 'json',
}

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
    polling: { sps: 60 } // Poll the ESM Object
})

const errorPage = document.createElement('div')
Object.assign(errorPage.style, {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
})

const h1 = document.createElement('h1')
h1.innerText = 'Nope lol'
const small = document.createElement('p')
const errorDiv = document.createElement('div')
errorDiv.appendChild(h1)
errorDiv.appendChild(small)
errorPage.appendChild(errorDiv)


let asyncLoads = false
async function init () {

    // ---------------- ESMpile ----------------
   if (!asyncLoads) {
    await esm.load.script('./libraries/esmpile/extensions/typescriptServices.min.js');
    asyncLoads = true
   }

   startFunction()
}


let active;

const selects = [{
    element: document.getElementById('demoSelect') as HTMLSelectElement,
    key: 'demo',
    selected: localStorage.getItem('demo'),
    options: demos
},{
    element: document.getElementById('modeSelect') as HTMLSelectElement,
    key: 'mode',
    selected: localStorage.getItem('mode'),
    options: modes
}]

selects.forEach(o => {
    for (let key in o.options) {
        const option = document.createElement('option')

        const value = o.options[key]
        const hasName = value?.name

        option.value = (hasName) ? key : value
        const text = (hasName) ? hasName : key
        option.innerHTML = text[0].toUpperCase() + text.slice(1)
        if (option.value === o.selected) option.selected = true
        o.element.appendChild(option)
    }
})

const restartButton = document.getElementById('restartButton') as HTMLButtonElement

function startFunction () {

    const args = selects.map(o => {
        const val = o.element.value
        localStorage.setItem(o.key, val)
        return val
    })

    if (active?.esDisconnected) active.esDisconnected()
    if (basicDemoSubs) {
        monitor.remove(basicDemoSubs)
        basicDemoSubs = undefined
    }
    
    console.log(`---------------- Starting ${args[0]} demo in ${args[1]} mode ----------------`)

    start(...args)
}
selects.forEach(o => o.element.addEventListener('change', startFunction))
restartButton.addEventListener('click', startFunction)



let basicDemoSubs;
async function start (demo = "basic", mode="direct") {
    
        try {
            // ------------------ ESCompose ------------------
            let selected = demos[demo]
        
        
            let reference = selected.file

            if (mode !== 'direct') {

                const toCompile = mode === 'json' ? selected.json : selected.js

                    
                const options: any = {}
                options.relativeTo = window.location.href + 'apps/showcase' // Relative to the HTML page using this file bundle
                options.collection = null //'global' // Specify which bundle to reference. Specify 'global' to use same bundle across all imports. Don't specify to create a new bundle
                options.debug = true // Show debug messages
                options.callbacks = {progress: {}}
                options.fallback = true // We want to fallback to text import
            
                options.filesystem = {
                    _fallbacks: selected.fallbacks
                }

                reference = await esm.compile(toCompile, options).catch(e => {
                    console.error('Compilation Failed:', e)
                })

                // ------------------ ESMpile (todo) ------------------
                // for (let file in monitor.dependencies) {
                //     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
                // }

                // reference = Object.assign({}, reference)
        
                console.log('ESMpile Result', reference)
            }



            if (!reference) throw new Error('Reference has been resolved as undefined.')
            if (errorPage.parentNode) errorPage.remove()

            // Basic
            if (demo === 'basic') {
                const esmId = 'ESM'
                const testComponent = reference.esDOM.test.esCompose // Grab from active reference
                monitor.set(esmId, testComponent)
                basicDemoSubs = monitor.on(esmId, (path, _, update) =>  console.log('Polling Result:', path, update))
            }
                

            // Create an active ES Component from a .esc file
            const component = escompose.create(reference, {
                monitor, // Use the existing monitor
                // listeners: { static: false } // Will be able to track new keys added to the object
                clone: true, // NOTE: If this doesn't happen, the reference will be modified by the create function
                listeners: { static: true },
                nested: undefined,
                utilities: {
                    code: escode.Editor
                }
            })

            component.esParent = main // ensure this is added to something that is ESM...

            active = component
        } catch (e) {
            small.innerText = e.message
            main.appendChild(errorPage)
        }

}


init()

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

