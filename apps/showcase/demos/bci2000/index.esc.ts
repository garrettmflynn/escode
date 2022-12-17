import * as bci2000 from "../../../../components/devices/modalities/bci2000/index.js"
import * as button from "../../../../components/ui/button.js"
import * as select from "../../../../components/ui/select.js"
import * as signal from "../signal/index.esc"

export const __attributes = {
    style: {
        position: 'relative',
        overflow: 'scroll',
        height: '100%',
        width: '100%',
    }
}

export const __children = {

    // BCI2000 Controller
    bci2000: {
        __compose: bci2000
    },

    // Controls Overlay
    overlay: {
        __attributes: {
            style: {
                position: 'fixed',
                zIndex: 1,
                color: 'white'
            }
        },
        __children: {
            p: {
                __element: 'p',
                __children: {
                    header: {
                        __element: 'b',
                        __attributes: {
                            innerText: 'Connection Status: '
                        }
                    },
                    span: {
                        __element: 'span',
                        __attributes: {
                            innerText: 'No Connection'
                        }
                    }
                }
            },
            select: {
                __compose: select,
                options: {
                    '127.0.0.1': "This Computer",
                    '192.168.0.11': "Garrett's PC"
                }
            },
            button: {
                __compose: button,
                __attributes: {
                    innerText: "Connect"
                }
            },
        }
    },

    // Main UI
    signal: {
        __compose: signal,
        __children: {
            plot: {        
                options: {
                    lineWidth: undefined,
                }
            },
            data: undefined // remove data generator
        },
        __listeners: {
            'plot': undefined
        }
    }
}



export const paragraphs = {}

export const __listeners = {
    'bci2000.ip': {
        'overlay.select': true
    },
    'bci2000.connect':{
        'overlay.button': {
            __branch: [{is: false, value: true}]
        }
    },
    "signal.plot": {
        "bci2000.raw": true
    },

    'overlay.p.span': {
        'bci2000.status': true
    },
    '': {

        'bci2000.states.StimulusCode': (...args) => console.log('New StimulusCode', args),

        // 'bci2000.raw': function (raw) {

        //     for (let key in raw) {
        //         if (!this.paragraphs[key]) {
        //             this.paragraphs[key] = document.createElement('p')
        //             this.__element.appendChild(this.paragraphs[key])
        //         }
        //         this.paragraphs[key].innerHTML = `<b>${key}:</b> ${raw[key]}`
        //     }
        // },

        'bci2000.signalProperties':  (props) => console.log('BCI2000 Signal Properties', props)

    }
}