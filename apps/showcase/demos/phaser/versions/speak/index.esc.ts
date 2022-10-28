
import * as multiplayer from '../multiplayer/index.esc'
import * as button from "../../../../../../components/ui/button.js"
import * as speak from "../../../../../../components/modalities/voice/speak.js"


// ----------------------------- Base Component -----------------------------
export const esCompose = multiplayer

// ----------------------------- Will Merge In -----------------------------
export const esAttributes = { style: { position: 'relative' } }

export const esListeners = {
    // Voice Controls
    'speak.start': {
        enableVoice: {
            esBranch: [
                {equals: true, value: true}
            ]
        }
    },

    // New Controls
    ['game.companion.jump']: {
        speak: {
            esBranch: [
                {equals: 'jump small alien', value: true},
            ]
        },
    },

    ['game.player.jump']: {
        speak: {
            esBranch: [
                {equals: 'jump big alien', value: true},
                {equals: 'jump', value: true},
            ]
        },
    }
}

export const esDOM = {

    // Voice Control
    enableVoice: {
        esElement: 'button',
        esAttributes: {
            innerText: 'Enable Voice Commands',
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px',
            },
        },
        esCompose: button
    },

    speak: {
        // grammar,
        esCompose: speak,
    },
}