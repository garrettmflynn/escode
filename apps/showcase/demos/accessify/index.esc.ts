import * as button from "../../../../components/ui/button";
import * as popup from "../../../../components/ui/popup"
import * as speak from "../../../../components/WebSpeechAPI/speak.js"


const colors = [ 'aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', /* … */ ];
const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')};`

export const esDOM = {

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
}


export const esListeners = {
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
    }
}