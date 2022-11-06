import * as signal from '../../index.esc'
import * as noise from '../../../../../../components/devices/extensions/noise/index.esc.js'

const power = [50, 60]
const movement = [1]

const noiseOverride =  {
    esDOM: {
        devices: noise
    }
}

export const esDOM =  {
    devices:{
        esDOM: {
            noise: {
                frequencies: [[...movement, ...power]] // setting custom frequencies
            }
        }
    }
}

export const esCompose = [noiseOverride, signal]