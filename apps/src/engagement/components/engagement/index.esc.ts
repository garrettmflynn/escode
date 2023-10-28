import bci from 'bcijs/browser.js'
import * as devices from "../../../../../../js/components/devices/ui/index.esc.js"
// import * as filter from "../../../../../../js/components/devices/extensions/filter/index.esc.js"

const sum = (a,b) => a + b

export const device = {

    // __compose: [filter, devices],
    __compose: [devices],
}

export const calculations = {


    engagement: undefined,

    default: function (signal) {
        const bands = ['theta', 'alpha', 'beta']
        const transposed = bci.transpose(signal)

        let powers = bci.bandpower(
            transposed,
            this.sps,
            bands,
        );

        const avePowers = powers.map(p => p.reduce(sum) / p.length)

        const engagement = (avePowers[2] / (avePowers[1] + avePowers[0])) // engagement
        this.engagement = engagement
    }
}


export const __listeners = {
    'calculations.sps': {
        'device.connect.sps': true,
    },

    'calculations': {
        'device.output': {
            data: [],
            onKey: function (key, o) {
                const i = parseInt(key)
                if (!this.data[i]) this.data[key] = o[key]
                else {
                    this.toReturn = [...this.data]
                    this.data = []
                    this.data[key] = o[key]
                }
            },
            __format: function (o) { 

                Object.keys(o).forEach(key => this.onKey(key, o))

                if (this.toReturn) {
                    const toReturn = this.toReturn
                    delete this.toReturn
                    return [toReturn] // return full array
                }
            }
        }
    }
}