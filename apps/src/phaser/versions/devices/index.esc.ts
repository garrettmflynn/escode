
import * as phaser from '../../index.esc'
import * as averageComponent from "../../../../../js/components/basic/average.js"
import * as thresholdComponent from "../../../../../js/components/basic/threshold.js"
import * as signalComponent from "../../../signal/index.esc"
import * as devicesComponent from "../../../../../js/components/devices/ui/index.esc.js"
import * as filter from "../../../../../js/components/devices/extensions/filter/index.esc.js"

// ----------------------------- Base Component -----------------------------
export const __compose = phaser

// export const __editor = true

// ----------------------------- Will Merge In -----------------------------
export const __attributes = { style: { position: 'relative' } }

export const __listeners = {
    ['game.player.jump']: {
        threshold: true
    },
    threshold: 'average',
    average: {
        'devices.output': {
            __format: (o) => { 
                const res = o[0]
                if (!res) return
                else return [res] // First channel only
            }
        }
    },
    ['signal.plot']: {
        'devices.output': true
    },
}

    // ---------- Blink Detector ----------
   export const average = {
        maxBufferSize: 20,
        buffer: [],
        __compose: averageComponent,
    }

    export const threshold = {
        value: 300,
        __compose: thresholdComponent,
    }

    export const devices = {
        __compose: [filter, devicesComponent],
    }

    export const signal = {
        __compose: signalComponent,
        __attributes: {
            style: {
                position: "absolute",
                bottom: "15px",
                right: "15px",
                width: "250px",
                height: "150px",
                zIndex: 1,
            }
        },

        devices: undefined, // unsetting device

        signalCanvas: {
            __attributes: {
                style: {
                    width: '100%',
                    height: '150px'
                }
            },
        },
        overlayCanvas: {
            __attributes: {
                style: {
                    width: '100%',
                    height: '150px'
                }
            },
        },
        __listeners: {
            'plot': false
        }
    }