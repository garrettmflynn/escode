import * as select from '../../ui/select.js'
import * as button from '../../ui/button.js'
import * as connect from '../connect.js'
import { deep } from '../../../libraries/common/clone.js'


export const output = false
export const ondata = (o) => deep(o) // Avoid mutation later

export const __children = {
    connectmode: {
        __compose: select
    },
    selectUSB: {
        __compose: select
    },
    selectBLE: {
        __compose: select
    },
    selectBLEOther: {
        __compose:select
    },
    selectOther: {
        __compose: select
    },
    connect: {
        __compose: connect
    },
    toConnect: {
        __attributes: {
            innerHTML: "Connect"
        },
        __compose: button
    }
}

export const __listeners = {
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