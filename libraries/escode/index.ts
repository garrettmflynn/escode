// ---------------------------------------------------------------------------------
// --------------- COMMENTED OUT SO THAT THE BASE BUILD DOESN'T FAIL ---------------
// ---------------------------------------------------------------------------------

// // Import Dependencies
// import './src/index.js'
// // import * as visualscript from './external/visualscript/dist/index.esm.js'

// import * as todoFile from '../../apps/showcase/demos/todo/index.esc'
// import createComponent from '../escompose/src/index'
// import Monitor from '../esmonitor/src/Monitor.js'

// // const createPlugins = async (src) => {
// //     const plugins = new Plugins(src)
// //     await plugins.init()
// //     console.log(`----------------------- Plugins -----------------------`)
// //     for await (let str of plugins.list){
// //         console.log(await plugins.metadata(str))
// //     }

// //     return plugins
// // }

// // -------------- Setup Default App --------------
// const appInfo = 'https://raw.githubusercontent.com/brainsatplay/wasl/main/tests/0/0.0/0.0.0/external/index.esc.json'
// // const appInfo = 'https://raw.githubusercontent.com/brainsatplay/brainsatplay-starter-kit/nightly'
// // const appInfo = `./app/index.js` // Automatically relative to window.location.href
// // import appInfo from '../brainsatplay-starter-kit/index.js' // not actually editable when loaded this way
// // import appInfo from '../htil/content/signals/index.js' // not actually editable when loaded this way
// // import appInfo from '../htil/content/phaser/index.js' // not actually editable when loaded this way

// // -------------- Setup Default App --------------
// const appOptions = { debug: true }

// // createPlugins()
// // -------------- Setup Elememts --------------
// // const displayName = document.querySelector('#name')

// const nav = document.querySelector('visualscript-nav') as any
// // nav.primary= {"menu": [{"content": "Products"}], "options": [{"content": "Test"}]}

// // <visualscript-button id=select primary>Select Project</visualscript-control>

// // let appElement = document.querySelector('visualscript-app')
// let editor = document.querySelector('brainsatplay-editor') as any
// // editor.setApp(app)

//     const options = [
//         {
//             "content": "Select Project",
//             "id": "select",
//             "type": "button",
//             onClick: async () => {
//                 start()
//             }
//         }
//     ]

//     nav.primary = {options}

// // -------------- Create System --------------
// start()

// // -------------- Setup Keyboard Shortcuts --------------
// document.onkeydown = async (e) => {
//     if (e.ctrlKey && e.code == 'KeyS') {
//         e.preventDefault()
//         console.error('Save not defined...')
//         // app.save() // Global save.
//     }
// };

// async function start(){
    
//     const main = document.getElementById('app') as HTMLElement

//     const selected = todoFile as any

//     // ------------------ ESMonitor ------------------
//     // let logUpdate = (path, info, newVal?: any) =>  console.log('Update:', path, info, newVal)

//     const monitor = new Monitor({
//         // onInit: logUpdate,
//         // onUpdate: {
//         //     callback: logUpdate,
//         //     info: {
//         //         performance: true
//         //     }
//         // },
//         pathFormat: 'absolute',
//         polling: { sps: 60 }
//     })

//     selected.esParent = main

//     // Create an active ES Component from a .esc file
//     const component = createComponent(selected, {
//         monitor, // Use the existing monitor
//         // listeners: { static: false } // Will be able to track new keys added to the object
//         listeners: { static: true }
//     })

//     console.log('component', component)

//     editor.setApp(component)

// }