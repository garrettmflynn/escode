import * as signal from '../../index.esc'
import * as noise from '../../../../../js/components/devices/extensions/noise/index.esc.js'

const power = [50, 60]
const movement = [1]

const noiseOverride =  {
    devices: noise
}

export const devices = {
    noise: {
        frequencies: [[...movement, ...power]] // setting custom frequencies
    }
}

export const __compose = [noiseOverride, signal]