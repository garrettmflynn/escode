import { drillSimple } from "./drill"

export const deep = (obj, opts={}) => {

    obj = Object.assign({}, obj) // Clone the orignal object

    opts.accumulator = Array.isArray(obj) ? [] : {}
    drillSimple(obj, (key, val, info) => {
        if (info.simple && info.object) return Array.isArray(val) ? [] : {}
        else return val
    }, opts)

    return opts.accumulator
}