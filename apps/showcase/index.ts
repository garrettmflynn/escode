
// -------------- Import Modules --------------
import * as escompose from '../../libraries/escompose/src/index'
// import ESC from "../../libraries/escode/src/core/index";
// import validate from "../../libraries/escode/src/validate/index";
import * as esm from '../../libraries/esmpile/src/index'
import * as escode from '../../libraries/escode/src/index'

// import canvasWorker from '../../components/ui/plot/utils/canvas.worker'
// import * as plotUtils from '../../components/ui/plot/utils/index'
// import * as timeseriesComponent from '../../components/ui/plot/timeseries'
// import * as signalComponent from './demos/signal/index.esc'

import demos from './demos' // All demos in one file

const modes = {
    'Direct': 'direct',
    ['File Compilation']: 'compilation',
    'JSON': 'json',
}

const main = document.getElementById('app') as HTMLElement

// ------------------ ESMonitor ------------------
// let logUpdate = (path, info, newVal?: any) =>  console.log('Update:', path, info, newVal)

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
    options: modes,
    hidden: true
}]

selects.forEach(o => {
    if (o.hidden) {
        o.element.style.display = 'none'
        const label = document.querySelector(`label[for="${o.element.id}"]`) as HTMLLabelElement
        label.style.display = 'none'
    }
    // else {
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
    // }
})

const resetButton = document.getElementById('resetButton') as HTMLButtonElement

function startFunction () {

    const args = selects.map(o => {
        const val = o.element.value
        localStorage.setItem(o.key, val)
        return val
    })

    if (active?.__ondisconnected) {
        active.__ondisconnected()
        active = undefined
    }
    
    console.log(`---------------- Starting ${args[0]} demo in ${args[1]} mode ----------------`)

    start(...args)
}
selects.forEach(o => o.element.addEventListener('change', startFunction))
resetButton.addEventListener('click', startFunction)



async function start (demo = "basic", mode="direct") {
    
        try {
            // ------------------ ESCompose ------------------
            let selected = demos[demo]
        
        
            let reference = selected.reference

            const nodeModules =  window.location.href + 'node_modules'

            if (mode !== 'direct') {

                const relativeTo = window.location.href + 'apps/showcase' // Relative to the HTML page using this file bundle
                const toCompile = mode === 'json' ? selected.json : selected.js

                    
                const options: any = {}
                options.relativeTo = relativeTo
                options.nodeModules = nodeModules
                options.collection = 'global' // Specify which bundle to reference. Specify 'global' to use same bundle across all imports. Don't specify to create a new bundle
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

                
            // Create an active ES Component from a .esc file

            const relativeTo = window.location.href + selected.relativeTo // Only used by the tutorial here...

            // // TODO: Fix so this works without fallbacks
            // const filesystem = {
            //     _fallbacks: {
            //         './components/ui/plot/utils/canvas.worker.ts': canvasWorker,
            //         './components/ui/plot/utils/index.ts': plotUtils,
            //         './components/ui/plot/timeseries.ts': timeseriesComponent,
            //         './apps/showcase/demos/signal/index.esc.ts': signalComponent,
            //     }
            // }

            const component = escompose.create(reference, {__parent: main}, {
                clone: true, // NOTE: If this doesn't happen, the reference will be modified by the create function
                
                await: true, 
                relativeTo,


                // For Editor Creation + Source Text Loading
                utilities: {
                    code: {
                        class: escode.Editor,
                        options: {}
                    },
                    bundle: {
                        function: esm.bundle.get,
                        options: {
                            nodeModules,
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


            active = esc

            if (demo === 'graph') {

                const graphDemo = esc
    
                graphDemo.nodeB.x += 1; //should trigger nodeA listener
    
                graphDemo.nodeB.nodeC.default(4); //should trigger nodeA listener
            
                graphDemo.nodeA.jump();
                        
                const popped = graphDemo.nodeB.__ondisconnected()
    
                graphDemo.__element.insertAdjacentHTML('beforeend', '<li><b>nodeB popped!</b></li>')
    
                popped.x += 1; //should no longer trigger nodeA.x listener on nodeC, but will still trigger the nodeB.x listener on nodeA
            
                graphDemo.nodeA.jump(); //this should not trigger the nodeA.jump listener on nodeC now
    
                setTimeout(()=>{ 
                    if (graphDemo === active) {
                        graphDemo.nodeE.__ondisconnected()  
                        graphDemo.__element.insertAdjacentHTML('beforeend', '<li><b>nodeE popped!</b></li>')
                    }
                }, 5500)
    
            }

        } catch (e) {
            console.error(e)
            small.innerText = e.message
            main.appendChild(errorPage)
        }

        console.log('Active ES Component:', active)

}


init()

// // Ensuring there is a container for the app
// component.__element = document.createElement('div')
// ui.main.appendChild(component.__element)


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

