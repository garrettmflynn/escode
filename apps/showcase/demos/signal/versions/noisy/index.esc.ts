import * as signal from '../../index.esc'
import * as noise from '../../../../../../components/devices/extensions/noise/index.esc.js'

const power = [50, 60]
const movement = [1]

const noiseOverride =  {
    __children: {
        devices: noise
    }
}

export const __children =  {
    devices:{
        __children: {
            noise: {
                frequencies: [[...movement, ...power]] // setting custom frequencies
            }
        }
    }
}

export const __compose = [noiseOverride, signal]