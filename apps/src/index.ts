// Basic ESC Demo
import * as escFile from './basic/index.esc'
import * as escFallbacks from './basic/fallbacks'
const escJSON = './src/basic/index.esc.json'
const escJS = './src/basic/index.esc.ts'

// // Basic Graph Demo
// import * as graphFile from './graph/index.esc'
// import * as graphFallbacks from './graph/fallbacks'
// const graphJSON = './src/graph/index.esc.json'
// const graphJS = './src/graph/index.esc.ts'

// Phaser Demo
import * as phaserFile from './phaser/index.esc'
import phaserFallbacks from './phaser/versions/devices/fallbacks'
const phaserJSON = './src/phaser/index.esc.json'
const phaserJS = './src/phaser/index.esc.ts'

// // Engagement Demo
// import * as engagementFile from './engagement/index.esc'
// import engagementFallbacks from './engagement/fallbacks'
// const engagementJSON = './src/engagement/index.esc.json'
// const engagementJS = './src/engagement/index.esc.ts'

// Animations Demo
import * as animationsFile from './animations/index.esc'
import animationsFallbacks from './animations/fallbacks'
const animationsJSON = './src/animations/index.esc.json'
const animationsJS = './src/animations/index.esc.ts'

// Todo Demo
import * as draggableFile from './draggable/index.esc'
import draggableFallbacks from './draggable/fallbacks'
const draggableJSON = './src/draggable/index.esc.json'
const draggableJS = './src/draggable/index.esc.ts'

// Multiplayer Phaser Demo
import * as multiplayerPhaserFile from './phaser/versions/multiplayer/index.esc'
import multiplayerPhaserFallbacks from './phaser/versions/multiplayer/fallbacks'
const multiplayerPhaserJSON = './src/phaser/versions/multiplayer/index.esc.json'
const multiplayerPhaserJS = './src/phaser/versions/multiplayer/index.esc.ts'

// Speak Phaser Demo
import * as speakPhaserFile from './phaser/versions/speak/index.esc'
import speakPhaserFallbacks from './phaser/versions/speak/fallbacks'
const speakPhaserJSON = './src/phaser/versions/speak/index.esc.json'
const speakPhaserJS = './src/phaser/versions/speak/index.esc.ts'

// Braintroller Demo
import * as braintrollerFile from './braintroller/index.esc'
const braintrollerJS = './braintroller/index.esc.ts'


// // Device Phaser Demo
// import * as devicePhaserFile from './phaser/versions/devices/index.esc'
// import devicePhaserFallbacks from './phaser/versions/devices/fallbacks'
// const devicePhaserJSON = './src/phaser/versions/devices/index.esc.json'
// const devicePhaserJS = './src/phaser/versions/devices/index.esc.ts'

// Todo Demo
import * as todoFile from './todo/index.esc'
import todoFallbacks from './todo/fallbacks'
const todoJSON = './src/todo/index.esc.json'
const todoJS = './src/todo/index.esc.ts'

// Accessify Demo
import * as accessifyFile from './accessify/index.esc'
import accessifyFallbacks from './accessify/fallbacks'
const accessifyJSON = './src/accessify/index.esc.json'
const accessifyJS = './src/accessify/index.esc.ts'

// Tutorial Demo
import * as tutorialFile from './tutorial/index.esc'
import tutorialFallbacks from './tutorial/fallbacks'
const tutorialJSON = './src/tutorial/index.esc.json'
const tutorialJS = './src/tutorial/index.esc.ts'

// Signal Demo
import * as signalFile from './signal/index.esc'
import signalFallbacks from './signal/fallbacks'
const signalJSON = './src/signal/index.esc.json'
const signalJS = './src/signal/index.esc.ts'

// Noise Demo
import * as noisySignalFile from './signal/versions/noisy/index.esc'
import noisySignalFallbacks from './signal/versions/noisy/fallbacks'
const noisySignalJSON = './src/signal/versions/noisy/index.esc.json'
const noisySignalJS = './src/signal/versions/noisy/index.esc.ts'


// Filter Demo
import * as filteredSignalFile from './signal/versions/filtered/index.esc'
import filteredSignalFallbacks from './signal/versions/filtered/fallbacks'
const filteredSignalJSON = './src/signal/versions/filtered/index.esc.json'
const filteredSignalJS = './src/signal/versions/filtered/index.esc.ts'

// Audiofeedback Demo
import * as audiofeedbackFile from './devices/audiofeedback/index.esc'
import audiofeedbackFallbacks from './devices/audiofeedback/fallbacks'
const audiofeedbackJSON = './demosdevices/audiofeedback/index.esc.json'
const audiofeedbackJS = './src/devices/audiofeedback/index.esc.ts'

// BCI2000 Demo
import * as bci2000File from './bci2000/index.esc'
import bci2000Fallbacks from './bci2000/fallbacks'
const bci2000JSON = './src/bci2000/index.esc.json'
const bci2000JS = './src/bci2000/index.esc.ts'

// P5 Demo
import * as p5File from './p5/index.esc'
import p5Fallback from './p5/fallbacks'
const p5JSON = './src/p5/index.esc.json'
const p5JS = './src/p5/index.esc.ts'

// P5 Demo
import * as wasmFile from './wasm/index.esc'
import wasmFallback from './wasm/fallbacks'
const wasmJSON = './src/wasm/index.esc.json'
const wasmJS = './src/wasm/index.esc.ts'


// // Broken
// else if (demo === 'audiofeedback') selected = audiofeedbackFile as string
// const audiofeedbackJSON = './src/devices/audiofeedback/index.esc.ts'



// ------------------ ES Components (more imports in files) ------------------

const basicPackage = {
    name: 'Basic',
    reference: escFile,
    fallbacks: escFallbacks,
    json: escJSON,
    js: escJS
}

// const graphPackage = {
//     name: 'GraphScript Test',
//     reference: graphFile,
//     fallbacks: graphFallbacks,
//     json: graphJSON,
//     js: graphJS
// }

const phaserPackage = {
    name: 'Game',
    reference: phaserFile,
    fallbacks: phaserFallbacks,
    json: phaserJSON,
    js: phaserJS

}

const animationsPackage = {
    name: 'Animations',
    json: animationsJSON,
    fallbacks: animationsFallbacks,
    reference: animationsFile,
    js: animationsJS,
    relativeTo: 'apps/showcase/src/animations'
}

// const engagementPackage = {
//     name: 'Engagement',
//     json: engagementJSON,
//     fallbacks: engagementFallbacks,
//     reference: engagementFile,
//     js: engagementJS

// }

const todoPackage = {
    name: 'Todo',
    json: todoJSON,
    fallbacks: todoFallbacks,
    reference: todoFile,
    js: todoJS
}

const draggablePackage = {
    name: 'draggable',
    json: draggableJSON,
    fallbacks: draggableFallbacks,
    reference: draggableFile,
    js: draggableJS
}

const multiplayerPackage = {
    name: 'Multiplayer Game',
    json: multiplayerPhaserJSON,
    fallbacks: multiplayerPhaserFallbacks,
    reference: multiplayerPhaserFile,
    js: multiplayerPhaserJS
}

const speakPackage = {
    name: 'Voice Controlled Game',
    json: speakPhaserJSON,
    fallbacks: speakPhaserFallbacks,
    reference: speakPhaserFile,
    js: speakPhaserJS
}

const braintrollerPackage = {
    name: 'Braintroller',
    reference: braintrollerFile,
    js: braintrollerJS
}


// const devicePackage = {
//     name: 'EMG-Controlled Game',
//     json: devicePhaserJSON,
//     fallbacks: devicePhaserFallbacks,
//     reference: devicePhaserFile,
//     js: devicePhaserJS
// }

const tutorialPackage = {
    name: 'ESCode Tutorial',
    json: tutorialJSON,
    fallbacks: tutorialFallbacks,
    reference: tutorialFile,
    js: tutorialJS,
    relativeTo: 'apps/showcase/src/tutorial'

}

const accessifyPackage = {
    name: 'Accessify',
    json: accessifyJSON,
    fallbacks: accessifyFallbacks,
    reference: accessifyFile,
    js: accessifyJS
}

// const signalPackage = {
//     name: 'Signal',
//     json: signalJSON,
//     fallbacks: signalFallbacks,
//     reference: signalFile,
//     js: signalJS
// }

// const noisySignalPackage = {
//     name: 'Noisy Signal',
//     json: noisySignalJSON,
//     fallbacks: noisySignalFallbacks,
//     reference: noisySignalFile,
//     js: noisySignalJS
// }

// const filteredSignalPackage = {
//     name: 'Filtered Signal',
//     json: filteredSignalJSON,
//     fallbacks: filteredSignalFallbacks,
//     reference: filteredSignalFile,
//     js: filteredSignalJS
// }

const audiofeedbackPackage = {
    name: 'HEG Audiofeedback',
    json: audiofeedbackJSON,
    fallbacks: audiofeedbackFallbacks,
    reference: audiofeedbackFile,
    js: audiofeedbackJS
}

const bci2000Package = {
    name: 'BCI2000Web',
    json: bci2000JSON,
    fallbacks: bci2000Fallbacks,
    reference: bci2000File,
    js: bci2000JS
}

const p5Package = {
    name: 'p5.js',
    json: p5JSON,
    fallbacks: p5Fallback,
    reference: p5File,
    js: p5JS,
    relativeTo: 'apps/showcase/src/p5'
}


const wasmPackage = {
    name: 'WebAssembly',
    json: wasmJSON,
    fallbacks: wasmFallback,
    reference: wasmFile,
    js: wasmJS,
    relativeTo: 'apps/showcase/src/wasm' // Appropriately find WASM asset
}

const demos = {

    // Complete Walkthrough
    tutorial: tutorialPackage,

    // Basic ESC Demos
    basic: basicPackage,
    animations: animationsPackage,
    draggable: draggablePackage,
    // engagement: engagementPackage,
    wasm: wasmPackage,


    todo: todoPackage,
    phaser: phaserPackage,
    multiplayer: multiplayerPackage,
    speak: speakPackage,
    braintroller: braintrollerPackage,

    // // Physiological Demos
    // signal: signalPackage,
    // noisy: noisySignalPackage,
    // filtered: filteredSignalPackage,
    // device: devicePackage,

    audiofeedback: audiofeedbackPackage,
    bci2000: bci2000Package,

    // Complete Applications
    accessify: accessifyPackage,

    // // Graph Demo
    // graph: graphPackage,

    // P5 Demo
    p5: p5Package
}


export default demos