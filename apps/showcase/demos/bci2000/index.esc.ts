import * as bci2000Component from "../../../../js/components/devices/modalities/bci2000/index.js"
import * as button from "../../../../js/components/ui/button.js"
import * as select from "../../../../js/components/ui/select.js"
// import * as signalComponent from "../signal/index.esc"

export const __attributes = {
    style: {
        background: 'black',
        position: 'relative',
        overflow: 'scroll',
        height: '100%',
        width: '100%',
    }
}

// BCI2000 Controller
export const bci2000 = {
    __compose: bci2000Component
}

// Controls Overlay
export const overlay = {
    __attributes: {
        style: {
            position: 'fixed',
            zIndex: 1,
            color: 'white'
        }
    },
    p: {
        __element: 'p',
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

// // Main UI
// export const signal = {
//     __compose: signalComponent,
//     plot: {
//         options: {
//             lineWidth: undefined,
//         }
//     },
//     data: undefined, // remove data generator
//     __listeners: {
//         'plot': undefined
//     }
// }


export const paragraphs = {}

export const __listeners = {
    'bci2000.ip': {
        'overlay.select': true
    },
    'bci2000.connect': {
        'overlay.button': {
            __branch: [{ is: false, value: true }]
        }
    },
    // "signal.plot": {
    //     "bci2000.raw": true
    // },

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

        'bci2000.signalProperties': (props) => console.log('BCI2000 Signal Properties', props)

    }
}