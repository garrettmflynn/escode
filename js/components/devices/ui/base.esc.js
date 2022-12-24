import * as select from '../../ui/select.js'
import * as button from '../../ui/button.js'
import * as connectComponent from '../connect.js'
import { deep } from '../../../../js/packages/common/clone.js'


export const output = false
export const ondata = (o) => deep(o) // Avoid mutation later

export const connectmode = {
    __compose: select
}

export const selectUSB = {
    __compose: select
}

export const selectBLE = {
    __compose: select
}

export const selectBLEOther = {
    __compose: select
}

export const selectOther = {
    __compose: select
}

export const connect = {
    __compose: connectComponent
}

export const toConnect = {
    __attributes: {
        innerHTML: "Connect"
    },
    __compose: button
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