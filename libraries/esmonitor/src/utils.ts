import { Options } from "../../common/types"
import { ArrayPath, MonitorOptions } from "./types"


export const isSame = (a,b) => {
    if (a && typeof a === 'object' && b && typeof b === 'object') {
        const jA = JSON.stringify(a)
        const jB = JSON.stringify(b)
        return jA === jB
    } else return a === b
}


export const iterateSymbols = (obj, callback) => {
    return Promise.all(Object.getOwnPropertySymbols(obj).map((sym: symbol) => callback(sym, obj[sym])))
}

export const  getPath = (type, info) => {
    const pathType = info.path[type]
    if (!pathType) throw new Error('Invalid Path Type')
    const filtered = pathType.filter((v) => typeof v === 'string')
    return filtered.join(info.keySeparator)
}


export const getPathInfo = (path, options: MonitorOptions) => {
    let splitPath = path
    if (typeof path === 'string') splitPath = path.split(options.keySeparator)
    else if (typeof path === 'symbol') splitPath = [path]
    return {
        id: splitPath[0],
        path: splitPath.slice(1) as ArrayPath,
    }
}

export const runCallback = (callback, path, info, output, setGlobal=true) => {
    if (callback instanceof Function) {
        
        // Promises
        if (typeof output === 'object' && typeof output.then === 'function') output.then(value => callback(path, info, value))

        // Normal
        else callback(path, info, output)
    }

    // ------------------ Set Manually in Inspected State ------------------
    if (setGlobal && window.ESMonitorState) {
        const callback = window.ESMonitorState.callback
        window.ESMonitorState.state[path] = { output, value: info }
        runCallback(callback, path, info, output, false)
    }
}