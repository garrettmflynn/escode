
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
import Monitor from '../../libraries/esmonitor/src/Monitor.js'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'

import demos from './demos' // All demos in one file

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

        console.log('Active ES Component:', active)

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

