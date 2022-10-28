import * as bci2000 from "../../../../components/devices/bci2000/index.js"
import * as button from "../../../../components/ui/button.js"
import * as select from "../../../../components/ui/select.js"
import * as signal from "../signal/index.esc"

export const esAttributes = {
    style: {
        position: 'relative',
        overflow: 'scroll',
        height: '100%',
        width: '100%',
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
                position: 'fixed',
                zIndex: 1,
                color: 'white'
            }
        },
        esDOM: {
            p: {
                esElement: 'p',
                esDOM: {
                    header: {
                        esElement: 'b',
                        esAttributes: {
                            innerText: 'Connection Status: '
                        }
                    },
                    span: {
                        esElement: 'span',
                        esAttributes: {
                            innerText: 'No Connection'
                        }
                    }
                }
            },
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
            plotter: {        
                options: {
                    lineWidth: undefined,
                }
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

    'overlay.p.span': 'bci2000.status',
    '': {

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