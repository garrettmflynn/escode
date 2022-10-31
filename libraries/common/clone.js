import { drillSimple } from "./drill"

export const deep = (obj, opts={}) => {

    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            obj = [...obj] // Clone the orignal object
            opts.accumulator = []
        } else {
            obj = {...obj} // Clone the orignal object
            opts.accumulator =  {}
        }
    } else return obj

    drillSimple(obj, (key, val, info) => {
        if (info.simple && info.object) return Array.isArray(val) ? [] : {}
        else return val
    }, opts)

    return opts.accumulator
}