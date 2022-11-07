
import * as multiplayer from '../multiplayer/index.esc'
import * as button from "../../../../../../components/ui/button.js"
import * as speak from "../../../../../../components/modalities/voice/speak.js"


// ----------------------------- Base Component -----------------------------
export const __compose = multiplayer

// ----------------------------- Will Merge In -----------------------------
export const __attributes = { style: { position: 'relative' } }

export const __listeners = {
    // Voice Controls
    'speak.start': {
        enableVoice: {
            __branch: [
                {equals: true, value: true}
            ]
        }
    },

    // New Controls
    ['game.companion.jump']: {
        speak: {
            __branch: [
                {equals: 'jump small alien', value: true},
            ]
        },
    },

    ['game.player.jump']: {
        speak: {
            __branch: [
                {equals: 'jump big alien', value: true},
                {equals: 'jump', value: true},
            ]
        },
    },
    
}

export const __children = {

    // Voice Control
    enableVoice: {
        __element: 'button',
        __attributes: {
            innerText: 'Enable Voice Commands',
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px',
            },
        },
        __compose: button
    },

    speak: {
        // grammar,
        __compose: speak,
    },
}