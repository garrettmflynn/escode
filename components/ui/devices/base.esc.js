import * as select from '../select.js'
import * as button from '../button.js'
import * as connect from '../../devices/connect.js'
import { deep } from '../../../libraries/common/clone.js'


export const output = false
export const ondata = (o) => deep(o) // Avoid mutation later

export const esDOM = {
    connectmode: {
        esCompose: select
    },
    selectUSB: {
        esCompose: select
    },
    selectBLE: {
        esCompose: select
    },
    selectBLEOther: {
        esCompose:select
    },
    selectOther: {
        esCompose: select
    },
    connect: {
        esCompose: connect
    },
    toConnect: {
        esAttributes: {
            innerHTML: "Connect"
        },
        esCompose: button
    }
}

export const esListeners = {
    toConnect: {
        selectBLE: true,
        selectUSB: true,
        selectBLEOther: true,
        selectOther: true,
    },
    connect: {
        toConnect: true
    },
    "connect.mode": {
        connectmode: true
    },

    // A separate node to drive processing
    output: {
        ondata: true
    },

    // Forward raw data
    ondata: {
        connect: true
    }
}