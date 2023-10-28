import * as button from "../../../js/components/ui/button";
import * as popupComponent from "../../../js/components/ui/popup"
import * as speakComponent from "../../../js/components/modalities/voice/speak.js"
import * as mouseComponent from "../../../js/components/modalities/mouse/index.js"
import * as keysComponent from "../../../js/components/basic/keyboard.js"
import * as switchComponent from "../../../js/components/modalities/switch/index.js"

const otherButton = {
    __element: 'button',
    __compose: button,
    default: function (...args) {

        const res = button.default.call(this, ...args)

        if (res) {
            const floor = 150
            const mult = 255 - floor
            const r = floor + mult * Math.random()
            const g = floor + mult * Math.random()
            const b = floor + mult * Math.random()
            this.__element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
        }
    }
}


// const numbers = [ '1', '2', '3', '4', '5', '6', '7', '8', '9'];
// const grammar = `#JSGF V1.0; grammar numbers; public <number> = ${numbers.join(' | ')};`

export const __attributes = {
    style: {
        padding: '50px'
    }
}

export const header = {
    __element: 'h1',
    __childposition: 0,
    __attributes: {
        innerText: 'Accessify'
    }
}

export const description = {

    __element: 'div',
    __childposition: 1,
    p1: {
        __element: 'p',
        __attributes: {
            innerHTML: 'This demonstration features <b>speech recognition</b>, <b>a virtual mouse using the keyboard</b>, and a <b>popup with a selectable grid</b> for selecting an item by its ID.'
        }
    },

    p2: {
        __element: 'p',
        __attributes: {
            innerHTML: 'You will need to <b>enable the popup and microphone access</b> to use this demonstration.'
        }
    }
}

// Voice Control
export const speak = {
    // grammar,
    __compose: speakComponent,
}

// Mouse Control
export const keys = {
    __compose: keysComponent,
}

export const mouse = {
    __compose: mouseComponent,
}

// Switch Control
export const binarySwitch = {
    __compose: switchComponent,
}

export const popup = {
    url: 'apps/src/accessify/popups/test.html',
    name: 'thispopup',
    __compose: popupComponent,
}


export const buttons = {
    enableVoice: {
        __element: 'button',
        __childposition: 1,
        __attributes: {
            innerText: 'Enable Voice Commands'
        },
        __compose: button
    },
    __childposition: 3
}

let nButtons = 20
for (let i = 0; i < nButtons; i++) buttons[`otherButton${i}`] = otherButton

export const __listeners = {

    // Voice Controls
    'speak.start': {
        'buttons.enableVoice': {
            __branch: [
                { is: true, value: true }
            ]
        }
    },

    // Switch Controls
    binarySwitch: {
        speak: {
            __format: (phrase) => [phrase, 'click'] // skip focus stage
        },
        ["keys.held"]: {
            __format: (state) => state.join('')
        },
        ['popup.onmessage']: {
            __format: (data) => {
                if (data?.message === 'clicked') return [data.clicked, 'click']
            }
        }
    },

    // Mouse Controls
    ['mouse.click']: {
        ['keys. ']: {
            __branch: [
                { is: true, value: true }
            ]
        }
    },

    ['mouse.move']: {
        ['keys.ArrowDown']: {
            __format: () => [{ y: 10 }]
        },
        ['keys.ArrowUp']: {
            __format: () => [{ y: -10 }]
        },
        ['keys.ArrowLeft']: {
            __format: () => [{ x: -10 }]
        },
        ['keys.ArrowRight']: {
            __format: () => [{ x: 10 }]
        },
    },

    // Popup Controls
    popup: {
        ['binarySwitch.register']: true,
    }
}


// export const __listeners = {

//     // Voice Controls
//     enableVoice: {
//         'speak.start': {
//             __branch: [
//                 {is: true, value: true}
//             ]
//         }
//     },
//     speak: {
//         switch: {
//             __format: (phrase) => [phrase, 'click'] // skip focus stage
//         }
//     },

//     // Keyboard Controls
//     ['keys. ']: {
//         ['mouse.click']: {
//             __branch: [
//                 {is: true, value: true}
//             ]
//         }
//     },

//     ['keys.ArrowDown']: {
//         ['mouse.move']: {
//             __format: () => [{y: 10}]
//         },
//     },

//     ['keys.ArrowUp']: {
//         ['mouse.move']: {
//             __format: () => [{y: -10}]
//         },
//     },

//     ['keys.ArrowLeft']: {
//         ['mouse.move']: {
//             __format: () => [{x: -10}]
//         },
//     },

//     ['keys.ArrowRight']: {
//         ['mouse.move']: {
//             __format: () => [{x: 10}]
//         },
//     },

//     ["keys.held"]: {
//         switch: {
//             __format: (state) => state.join('')
//         }
//     },

//     // Switch Controls
//     ['switch.register']: {
//         popup: true
//     },

//     ['popup.onmessage']: {
//         switch: {
//             __format: (data) => {
//                 if (data?.message === 'clicked') return [data.clicked, 'click']
//             }
//         }
//     }
// }