
import * as averageComponent from "../../../js/components/basic/average.js"
import * as thresholdComponent from "../../../js/components/basic/threshold.js"
import * as signalComponent from "../signal/index.esc.js"
import * as devicesComponent from "../../../js/components/devices/ui/index.esc.js"
import * as filter from "../../../js/components/devices/extensions/filter/index.esc.js"
import * as keysComponent from "../../../js/components/basic/keyboard.js"
import * as buttonComponent from '../../../js/components/ui/button.js'

import * as braintroller from './browser/index'
const client = new braintroller.Client()


export const keys = {
    __compose: keysComponent
}

client.onopen = () => {
    console.log('Connected!')
}

client.onclose = () => {
    console.log('Closed...')
}

export const button = {
    __element: 'button',
    __compose: buttonComponent,
    __attributes: {
        style: {
            position: 'absolute',
            top: '0',
            right: '0',
            zIndex: 1000
        },
        // onclick: () => {
        //     console.log('Clicked!')
        // },
    },
    // __trigger: {value: true, __internal: true}
}

// export const __editor = true

// ----------------------------- Will Merge In -----------------------------
export const __attributes = { style: { 
    width: '100%',
    height: '100%',
    position: 'relative' 
} }

export function send (status){
    if (status && this.sent === false ) {
        console.log('Sending!', status)
        this.sent = true
        client.send('key', 'c')
        setTimeout(() => this.sent = false, this.sendRefractoryPeriod) // minimum 1.5 seconds

    }
}

export let sendRefractoryPeriod = 1000 // wait until next jump

export let sent = false

export const __listeners = {
    threshold: {
        average: true
    },
    average: {
        'devices.output': {
            __format: (o) => { 
                const res = o[0]
                if (!res) return
                else return [res] // First channel only
            }
        }
    },
    // ['signal.plot']: {
    //     'devices.output': true
    // },

    // 'devices.output': (...args) => console.log('Output!', ...args),

    // Main Player Controls
    send: {
        ['keys.ArrowUp']: true,
        threshold: true
    },

    button: (status) => {
        if (status) client.connect('192.168.0.30')
    }

    // ['game.player.velocity']: {

    //     ['keys.ArrowLeft']: {  
    //         __branch: [
    //             { is: true, value: -150 },
    //             { is: false, value: 0 },
    //         ]
    //     },

    //     ['keys.ArrowRight']: {
    //         __branch: [
    //             { is: true, value: 150 },
    //             { is: false, value: 0 },
    //         ]
    //     }
    // }
}

    // ---------- Blink Detector ----------
   export const average = {
        maxBufferSize: 20,
        buffer: [],
        __compose: averageComponent,
    }

    export const threshold = {
        value: 400,
        __compose: thresholdComponent,
    }

    export const devices = {
        __compose: [filter, devicesComponent],
    }

    // export const signal = {
    //     __compose: signalComponent,
    //     __attributes: {
    //         style: {
    //             position: "absolute",
    //             bottom: "15px",
    //             right: "15px",
    //             width: "250px",
    //             height: "150px",
    //             zIndex: 1,
    //         }
    //     },

    //     devices: undefined, // unsetting device

    //     signalCanvas: {
    //         __attributes: {
    //             style: {
    //                 width: '100%',
    //                 height: '150px'
    //             }
    //         },
    //     },
    //     overlayCanvas: {
    //         __attributes: {
    //             style: {
    //                 width: '100%',
    //                 height: '150px'
    //             }
    //         },
    //     },
    //     __listeners: {
    //         'plot': false
    //     }
    // }