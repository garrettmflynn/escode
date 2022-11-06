import * as signal from '../../index.esc'
import * as noise from '../../../../../../components/devices/noise.esc.js'


const customNoise = {
    esDOM: {
        noise: {
            frequencies: [[10, 1, 60]]
        }
    },
    esCompose: noise
}
export const esCompose = signal

export const esDOM = {
    devices: {
        esCompose: customNoise
    }
}

