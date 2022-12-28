
import * as multiplayer from '../multiplayer/index.esc'
import * as button from "../../../../../../js/components/ui/button.js"
import * as speakComponent from "../../../../../../js/components/modalities/voice/speak.js"


// ----------------------------- Base Component -----------------------------
export const __compose = multiplayer

// ----------------------------- Will Merge In -----------------------------
export const __attributes = { style: { position: 'relative' } }

export const __listeners = {
    // Voice Controls
    'speak.start': {
        enableVoice: {
            __branch: [
                {is: true, value: true}
            ]
        }
    },

    // New Controls
    ['game.companion.jump']: {
        speak: {
            __branch: [
                {is: 'jump small alien', value: true},
            ]
        },
    },

    ['game.player.jump']: {
        speak: {
            __branch: [
                {is: 'jump big alien', value: true},
                {is: 'jump', value: true},
            ]
        },
    },
    
}

    // Voice Control
    export const enableVoice = {
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
    }

    export const speak = {
        // grammar,
        __compose: speakComponent,
    }
