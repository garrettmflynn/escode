// https://github.com/joshbrew/BiquadFilters.js
import { BiquadChannelFilterer } from 'biquadjs'

export const ref = undefined

export const settings = {
    sps: 512,
    useBandpass: true,
    useDCBlock: true,
}

export const esListeners = {
    'update': {
        "settings.sps": true
    }
}

export function update() {
    this.ref = new BiquadChannelFilterer(this.settings);
}

export function esConnected () {
    this.update()
}

const symbol = Symbol()
const checkIfObj = (input) => input && typeof input === 'object'

export default function (input) {
    const isObj = checkIfObj(input)
    if (!isObj) input = {[symbol]: input}

    for (let key in input) {
        let val = input[key]
        const isObj = checkIfObj(val)
        if (!isObj) val = {[symbol]: val}
        for (let key in val) val[key] = this.ref.apply(val[key]);
        if (!isObj) val = {[symbol]: val}
        input[key] = isObj ? val : val[symbol]
    }

    return isObj ? input : input[symbol]
}