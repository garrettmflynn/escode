import * as base from './base.esc.js'
import * as thirdPartyDecoder from "device-decoder.third-party"
import * as preprocessComponent from '../extensions/preprocess.esc.js'

// import * as devices from "./dist/index.esm.js"

export const __compose = base

export const __attributes = {
    style: {
        zIndex: 100,
        position: 'absolute',
        top: '0',
        right: '0',
        left: '0',
    }
}

    export const connectmode = {
        options: [
            {
                value: "OTHER",
                show: "selectOther"
            },
            {
                value: "BLE",
                show: "selectBLE"
            },
            {
                value: "USB",
                show: "selectUSB"
            },
            {
                value: "BLE_OTHER",
                show: "selectBLEOther"
            }
        ]
    }

    export const selectUSB = {
        options: {
            cyton:"Open BCI Cyton",
            cyton_daisy:"Open BCI Cyton x2 (daisy chain mode)",
            freeeeg32:"FreeEEG32",
            freeeeg32_optical:"FreeEEG32 optical cable",
            freeeeg128: "FreeEEG128",
            nrf5x: "nRF5x board"
        },
    }

    export const selectBLE = {
        options: {
            nrf5x: "nRF5x board"
        },
    }

    export const selectBLEOther = {
        options: {
            muse: "Muse",
            ganglion: "Ganglion"
        },
    }

    export const selectOther = {
        options: {
            simulator: "Simulator"
        },
    }

    // Add Third Party Decoders
   export const connect = {
        thirdPartyDecoder,
        // workerUrl: {
        //     __compose: "./scripts/workers/stream.big.worker.js",
        // },
    }

    // Add Preprocessing Step
    export const preprocess = preprocessComponent

export const __listeners = {

    // Redirect through Preprocessing
    preprocess: {
        ondata: true
    },

    output: {
        ondata: false,
        preprocess: true
    }
}