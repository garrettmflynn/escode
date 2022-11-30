// Basic ESC Demo
import * as escFile from './demos/basic/index.esc'
import * as escFallbacks from './demos/basic/fallbacks'
const escJSON = './/demos/basic/index.esc.json'
const escJS = './demos/basic/index.esc.ts'

// Basic ESC Demo
import * as graphFile from './demos/graph/index.esc'
import * as graphFallbacks from './demos/graph/fallbacks'
const graphJSON = './/demos/graph/index.esc.json'
const graphJS = './demos/graph/index.esc.ts'

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

// Todo Demo
import * as draggableFile from './demos/draggable/index.esc'
import draggableFallbacks from './demos/draggable/fallbacks'
const draggableJSON = './demos/draggable/index.esc.json'
const draggableJS = './demos/draggable/index.esc.ts'

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
const noisySignalJSON = './demos/signal/versions/noisy/index.esc.json'
const noisySignalJS = './demos/signal/versions/noisy/index.esc.ts'


// Filter Demo
import * as filteredSignalFile from './demos/signal/versions/filtered/index.esc'
import filteredSignalFallbacks from './demos/signal/versions/filtered/fallbacks'
const filteredSignalJSON = './demos/signal/versions/filtered/index.esc.json'
const filteredSignalJS = './demos/signal/versions/filtered/index.esc.ts'

// Audiofeedback Demo
import * as audiofeedbackFile from './demos/devices/audiofeedback/index.esc'
import audiofeedbackFallbacks from './demos/devices/audiofeedback/fallbacks'
const audiofeedbackJSON = './demosdevices/audiofeedback/index.esc.json'
const audiofeedbackJS = './demos/devices/audiofeedback/index.esc.ts'

// BCI2000 Demo
import * as bci2000File from './demos/bci2000/index.esc'
import bci2000Fallbacks from './demos/bci2000/fallbacks'
const bci2000JSON = './demos/bci2000/index.esc.json'
const bci2000JS = './demos/bci2000/index.esc.ts'

// P5 Demo
import * as p5File from './demos/p5/index.esc'
import p5Fallback from './demos/p5/fallbacks'
const p5JSON = './demos/p5/index.esc.json'
const p5JS = './demos/p5/index.esc.ts'


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

const graphPackage = {
    name: 'GraphScript Test',
    file: graphFile,
    fallbacks: graphFallbacks,
    json: graphJSON,
    js: graphJS
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

const draggablePackage = {
    name: 'draggable',
    json: draggableJSON,
    fallbacks: draggableFallbacks,
    file: draggableFile,
    js: draggableJS
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
    js: tutorialJS,
    relativeTo: 'apps/showcase/demos/tutorial'

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

const filteredSignalPackage = {
    name: 'Filtered Signal',
    json: filteredSignalJSON,
    fallbacks: filteredSignalFallbacks,
    file: filteredSignalFile,
    js: filteredSignalJS
}
const audiofeedbackPackage = {
    name: 'HEG Audiofeedback',
    json: audiofeedbackJSON,
    fallbacks: audiofeedbackFallbacks,
    file: audiofeedbackFile,
    js: audiofeedbackJS
}

const bci2000Package = {
    name: 'BCI2000Web',
    json: bci2000JSON,
    fallbacks: bci2000Fallbacks,
    file: bci2000File,
    js: bci2000JS
}

const p5Package = {
    name: 'p5.js',
    json: p5JSON,
    fallbacks: p5Fallback,
    file: p5File,
    js: p5JS,
    relativeTo: 'apps/showcase/demos/p5'
}


const demos = {

    // Complete Walkthrough
    tutorial: tutorialPackage,

    // Basic ESC Demos
    basic: basicPackage,
    animations: animationsPackage,
    draggable: draggablePackage,

    todo: todoPackage,
    phaser: phaserPackage,
    multiplayer: multiplayerPackage,
    speak: speakPackage,

    // Physiological Demos
    signal: signalPackage,
    noisy: noisySignalPackage,
    filtered: filteredSignalPackage,
    device: devicePackage,

    audiofeedback: audiofeedbackPackage,
    bci2000: bci2000Package,

    // Complete Applications
    accessify: accessifyPackage,

    // Graph Demo
    graph: graphPackage,

    // P5 Demo
    p5: p5Package
}


export default demos