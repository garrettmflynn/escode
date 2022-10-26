
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
import Monitor from '../../libraries/esmonitor/src/Monitor.js'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";


// Basic ESC Demo
import * as esm from '../../libraries/esmpile/src/index'
import * as escFile from './index.esc'
import * as escFallbacks from './fallbacks'
import * as testComponent from '../../components/tests/basic/index.js'


// Phaser Demo
import * as phaserFile from './demos/phaser/index.esc'
import phaserFallbacks from './demos/phaser/fallbacks'

// Animations Demo
import * as animationsFile from './demos/animations/index.esc'
import animationsFallbacks from './demos/animations/fallbacks'

// else if (demo === 'multiplayer') selected = multiplayerPhaserFile as string
// else if (demo === 'device') selected = devicePhaserFile as string // BROKEN
// else if (demo === 'todo') selected = todoFile as string
// else if (demo === 'tutorial') selected = tutorialFile as string
// else if (demo === 'accessify') selected = accessifyFile as string

// // Broken
// else if (demo === 'audiofeedback') selected = audiofeedbackFile as string



// ------------------ ES Components (more imports in files) ------------------
const escJSON = './index.esc.ts'
const phaserJSON = './demos/phaser/index.esc.ts'
const audiofeedbackJSON = './demos/devices/audiofeedback/index.esc.ts'
const todoJSON = './demos/todo/index.esc.ts'
const multiplayerPhaserJSON = './demos/phaser/versions/multiplayer.esc.ts'
const devicePhaserJSON = './demos/phaser/versions/devices.esc'
const tutorialJSON = './demos/tutorial/index.esc.ts'
const animationsJSON = './demos/animations/index.esc.ts'
const accessifyJSON = './demos/accessify/index.esc.ts'


const basicPackage = {
    file: escFile,
    fallbacks: escFallbacks,
    json: escJSON
}

const phaserPackage = {
    file: phaserFile,
    fallbacks: phaserFallbacks,
    json: phaserJSON
}

const animationsPackage = {
    json: animationsJSON,
    fallbacks: animationsFallbacks,
    file: animationsFile
}

const demos = {
    phaser: phaserPackage,
    animations: animationsPackage,
    basic: basicPackage
}

const modes = ['direct', 'reference', 'import']

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

let asyncLoads = false
async function init () {

    // ---------------- ESMpile ----------------
   if (!asyncLoads) {
    await esm.load.script('./libraries/esmpile/extensions/typescriptServices.min.js');
    asyncLoads = true
   }

   start(demoSelect.value, modeSelect.value)
}


let active;
const demoSelect = document.getElementById('demoSelect') as HTMLSelectElement
const demo = localStorage.getItem('demo')

for (let key in demos) {
    const option = document.createElement('option')
    option.value = key
    option.innerHTML = key
    if (key === demo) option.selected = true
    demoSelect.appendChild(option)
}

const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement
const mode = localStorage.getItem('mode')
modes.forEach(key => {
    const option = document.createElement('option')
    option.value = key
    option.innerHTML = key
    if (key === mode) option.selected = true
    modeSelect.appendChild(option)
})


const restartButton = document.getElementById('restartButton') as HTMLButtonElement

demoSelect.onchange = modeSelect.onchange = restartButton.onclick = () =>  start(demoSelect.value, modeSelect.value)



let basicDemoSubs;
async function start (demo = "basic", mode="direct") {
    
        localStorage.setItem('demo', demo)
        localStorage.setItem('mode', mode)

        if (active?.esDelete) active.esDelete()
        if (basicDemoSubs) {
            monitor.remove(basicDemoSubs)
            basicDemoSubs = undefined
        }

        console.log(`---------------- Starting ${demo} demo in ${mode} mode ----------------`)

        // ------------------ ESCompose ------------------
        let selected = demos[demo]
    
        // Basic
        if (demo === 'basic') {
            const esmId = 'ESM'
            monitor.set(esmId, testComponent)
            basicDemoSubs = monitor.on(esmId, (path, _, update) =>  console.log('Polling Result:', path, update))
        }
    
    
        let reference = selected.file

        if (mode === 'reference' || mode === 'import') {

                
            const options: any = {}
            options.relativeTo = window.location.href + 'apps/showcase' // Relative to the HTML page using this file bundle
            options.collection = null //'global' // Specify which bundle to reference. Specify 'global' to use same bundle across all imports. Don't specify to create a new bundle
            options.debug = true // Show debug messages
            options.callbacks = {progress: {}}
            options.fallback = true // We want to fallback to text import
        
            options.filesystem = {
                _fallbacks: selected.fallbacks
            }

            reference = await esm.compile(selected.json, options).catch(e => {
                console.error('Compilation Failed:', e)
            })

                
            // ------------------ ESMpile (todo) ------------------
            // for (let file in monitor.dependencies) {
            //     for (let dep in monitor.dependencies[file]) subscribe(dep, [], true)
            // }
    
        
            console.log('Reference / Import Mode', reference)
        }

        reference.esParent = main
            
        // Create an active ES Component from a .esc file
        const component = escompose.create(reference, {
            monitor, // Use the existing monitor
            // listeners: { static: false } // Will be able to track new keys added to the object
            clone: true, // NOTE: If this doesn't happen, the reference will be modified by the create function
            listeners: { static: true },
            nested: undefined
        })


        active = component
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

