import { drillSimple } from "./drill"

export const deep = (obj, opts={}) => {

    opts.accumulator = {}
    drillSimple(obj, (key, val, info) => {
        if (info.simple && info.object) return Array.isArray(val) ? [] : {}
        else return val
    }, opts)

    return opts.accumulator
}