import * as button from "../../../../components/ui/button";
import * as popup from "../../../../components/ui/popup"
import * as speak from "../../../../components/WebSpeechAPI/speak.js"
import * as mouse from "../../../../components/ui/mouse/index.js"
import * as keys from "../../../../components/basic/keyboard.js"
import * as log from "../../../../components/basic/log";


const colors = [ 'aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', /* … */ ];
const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')};`

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
                    innerText: 'This demonstration shows how to use Accessify to make your application accessible to people with disabilities.'
                }
            },

            p2: {
                esElement: 'p',
                esAttributes: {
                    innerHTML: 'It features <b>speech recognition</b>, <b>a virtual mouse controlled by the keyboard</b>, and a <b>popup implementing the SSVEP / P300 paradigms</b> for brain-computer interfaces'
                }
            }
        }
    },

    log: {
        esCompose: log
    },

    keys: {
        esCompose: keys,
    },

    startVoiceCommand: {
        esElement: 'button',
        esAttributes: {
            innerText: 'Start Voice Command'
        },
        esCompose: button
    },

    popup: {
        url: 'apps/showcase/demos/accessify/popups/test.html',
        name: 'thispopup',
        esCompose: popup,
    }, 

    speak: {
        grammar,
        esCompose: speak,
    }, 

    mouse: {
        esCompose: mouse,
    }, 
}


export const esListeners = {

    // Voice Controls
    startVoiceCommand: {
        'speak.start': {
            esBranch: [
                {equals: true, value: true}
            ]
        }
    },
    speak: {
       popup: {
            esFormat: (phrase) => [{ color: phrase }]
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
}