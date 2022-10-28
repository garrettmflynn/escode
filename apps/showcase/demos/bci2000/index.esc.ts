import * as bci2000 from "../../../../components/devices/bci2000"
import * as button from "../../../../components/ui/button"
import * as select from "../../../../components/ui/select"
import * as signal from "../signal/index.esc"

export const esAttributes = {
    style: {
        position: 'relative',
    }
}

export const esDOM = {

    // BCI2000 Controller
    bci2000: {
        esCompose: bci2000
    },

    // Controls Overlay
    overlay: {
        esAttributes: {
            style: {
                position: 'absolute',
                top: '0',
                left: '0',
                zIndex: 1
            }
        },
        esDOM: {
            select: {
                esCompose: select,
                options: {
                    '127.0.0.1': "This Computer",
                    '192.168.0.11': "Garrett's PC"
                }
            },
            button: {
                esCompose: button,
                esAttributes: {
                    innerText: "Connect"
                }
            },
        }
    },

    // Main UI
    signal: {
        esCompose: signal,
        esDOM: {
            signalCanvas: {
                width: '100%',
                height: '100vh',
            },
            overlayCanvas: {
                width: '100%',
                height: '100vh',
            },
            data: undefined // remove data generator
        },
        esListeners: {
            'plotter': undefined
        }
    }
}



export const paragraphs = {}

export const esListeners = {
    'bci2000.ip': {
        'overlay.select': true
    },
    'bci2000.connect':{
        'overlay.button': {
            esBranch: [{equals: false, value: true}]
        }
    },
    "signal.plotter": {
        "bci2000.raw": true
    },
    '': {
        'bci2000.status': (...args) => console.log('BCI2000 Status', args),
        'bci2000.states.StimulusCode': (...args) => console.log('New StimulusCode', args),

        // 'bci2000.raw': function (raw) {

        //     for (let key in raw) {
        //         if (!this.paragraphs[key]) {
        //             this.paragraphs[key] = document.createElement('p')
        //             this.esElement.appendChild(this.paragraphs[key])
        //         }
        //         this.paragraphs[key].innerHTML = `<b>${key}:</b> ${raw[key]}`
        //     }
        // },

        'bci2000.signalProperties':  (props) => console.log('BCI2000 Signal Properties', props)

    }
}