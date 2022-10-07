// Import Dependencies
import './src/index.js'
import * as visualscript from './external/visualscript/dist/index.esm.js'
import * as brainsatplay from './external/brainsatplay/index.esm.js';

// const createPlugins = async (src) => {
//     const plugins = new Plugins(src)
//     await plugins.init()
//     console.log(`----------------------- Plugins -----------------------`)
//     for await (let str of plugins.list){
//         console.log(await plugins.metadata(str))
//     }

//     return plugins
// }

// -------------- Setup Default App --------------
const appInfo = 'https://raw.githubusercontent.com/brainsatplay/wasl/main/tests/0/0.0/0.0.0/external/index.wasl.json'
// const appInfo = 'https://raw.githubusercontent.com/brainsatplay/brainsatplay-starter-kit/nightly'
// const appInfo = `./app/index.js` // Automatically relative to window.location.href
// import appInfo from '../brainsatplay-starter-kit/index.js' // not actually editable when loaded this way
// import appInfo from '../htil/content/signals/index.js' // not actually editable when loaded this way
// import appInfo from '../htil/content/phaser/index.js' // not actually editable when loaded this way

// -------------- Setup Default App --------------
const appOptions = { debug: true }

// createPlugins()
// -------------- Setup Elememts --------------
// const displayName = document.querySelector('#name')

const nav = document.querySelector('visualscript-nav')
// nav.primary= {"menu": [{"content": "Products"}], "options": [{"content": "Test"}]}

// <visualscript-button id=select primary>Select Project</visualscript-control>

// let appElement = document.querySelector('visualscript-app')
let editor = document.querySelector('brainsatplay-editor')
// editor.setApp(app)

    const options = [
        {
            "content": "Select Project",
            "id": "select",
            "type": "button",
            onClick: async () => {
                start()
            }
        }
    ]

    nav.primary = {options}

// -------------- Create System --------------
start(appInfo)

// -------------- Setup Keyboard Shortcuts --------------
document.onkeydown = async (e) => {
    if (e.ctrlKey && e.code == 'KeyS') {
        e.preventDefault()
        app.save() // Global save.
    }
};

async function start(input, options=appOptions){
    
    // Create New Global App
    app = new brainsatplay.App(
        undefined,
        appOptions
    )

    appOptions.parentNode = editor.ui
    appOptions.edit = true // force into filesystem

    // TODO: Fix app onstart event...
    app.onstart = () => {
        editor.start()
    }

    console.log(input, options)
   const wasl = await app.start(input, options).catch(e => console.error('Invalid App', e))

    if (wasl) editor.setApp(app)

    console.log('App', app)


}