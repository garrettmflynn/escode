import * as select from '../select.js'
import * as button from '../button.js'
import * as connect from '../../devices/connect.js'

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
    }
}