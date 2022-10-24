import * as button from "../../../../components/ui/button";
import * as popup from "../../../../components/ui/popup"
import * as speak from "../../../../components/modalities/voice/speak.js"
import * as mouse from "../../../../components/modalities/mouse/index.js"
import * as keys from "../../../../components/basic/keyboard.js"
import * as switchComponent from "../../../../components/modalities/switch/index.js"

const otherButton = {
    esElement: 'button',
    esCompose: button,
    default: function (...args) {

        const res = button.default.call(this, ...args)

        if (res){
            const floor = 150
            const mult = 255 - floor
            const r = floor + mult*Math.random()
            const g = floor + mult*Math.random()
            const b = floor + mult*Math.random()
            this.esElement.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
        }
    }
}


const numbers = [ '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const grammar = `#JSGF V1.0; grammar numbers; public <number> = ${numbers.join(' | ')};`

export const esAttributes = {
    style: {
        padding: '50px'
    }
}

export const esDOM = {

    header: {
        esElement: 'h1',
        esAttributes: {
            innerText: 'Accessify'
        }
    },

    description: {
        esDOM: {

            p1: {
                esElement: 'p',
                esAttributes: {
                    innerHTML: 'This demonstration features <b>speech recognition</b>, <b>a virtual mouse using the keyboard</b>, and a <b>popup with a selectable grid</b> for selecting an item by its ID.'
                }
            },

            p2: {
                esElement: 'p',
                esAttributes: {
                    innerHTML: 'You will need to <b>enable the popup and microphone access</b> to use this demonstration.'
                }
            }
        }
    },

    // Voice Control
    enableVoice: {
        esElement: 'button',
        esAttributes: {
            innerText: 'Enable Voice Commands'
        },
        esCompose: button
    },

    speak: {
        // grammar,
        esCompose: speak,
    }, 

    // Mouse Control
    keys: {
        esCompose: keys,
    },

    mouse: {
        esCompose: mouse,
    }, 

    // Switch Control
    switch: {
        esCompose: switchComponent,
    },

    popup: {
        url: 'apps/showcase/demos/accessify/popups/test.html',
        name: 'thispopup',
        esCompose: popup,
    },
}

let nButtons = 24
for (let i = 0; i < nButtons; i++) {
    esDOM[`otherButton${i}`] = otherButton
}

export const esListeners = {

    // Voice Controls
    enableVoice: {
        'speak.start': {
            esBranch: [
                {equals: true, value: true}
            ]
        }
    },
    speak: {
        switch: {
            esFormat: (phrase) => [phrase, 'click'] // skip focus stage
        }
    },

    // Keyboard Controls
    ['keys. ']: {
        ['mouse.click']: {
            esBranch: [
                {equals: true, value: true}
            ]
        }
    },

    ['keys.ArrowDown']: {
        ['mouse.move']: {
            esFormat: () => [{y: 10}]
        },
    },

    ['keys.ArrowUp']: {
        ['mouse.move']: {
            esFormat: () => [{y: -10}]
        },
    },

    ['keys.ArrowLeft']: {
        ['mouse.move']: {
            esFormat: () => [{x: -10}]
        },
    },

    ['keys.ArrowRight']: {
        ['mouse.move']: {
            esFormat: () => [{x: 10}]
        },
    },

    ["keys.held"]: {
        switch: {
            esFormat: (state) => state.join('')
        }
    },

    // Switch Controls
    ['switch.register']: {
        popup: true
    },

    ['popup.onmessage']: {
        switch: {
            esFormat: (data) => {
                if (data?.message === 'clicked') return [data.clicked, 'click']
            }
        }
    }
}