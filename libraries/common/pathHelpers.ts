import { PathFormat } from "../esmonitor/src/types"
import * as standards from './standards'

const hasKey = (key, obj) => {
    return obj.hasOwnProperty(key) || key in obj
}

export const getFromPath = (baseObject, path, opts: any = {}) => {
    const fallbackKeys = opts.fallbacks ?? []
    const keySeparator = opts.keySeparator ?? standards.keySeparator

    if (typeof path === 'string') path = path.split(keySeparator)
    else if (typeof path == 'symbol') path = [path]

    let exists;
    path = [...path]

    let ref =  baseObject
    for (let i = 0; i < path.length; i++) {

        if (!ref) {
            const message = `Could not get path`
            console.error(message, path, ref)
            throw new Error(message)
        }

        const str = path[i]
        // Try Inside ES Components
        if (!hasKey(str, ref) && ref.hasOwnProperty('esComponents')) {
            for (let i in fallbackKeys) {
                const key = fallbackKeys[i]
                if (hasKey(key, ref)) {
                    ref = ref[key]
                    break
                }
            }
        }
        
        // Try Standard Path
        exists = hasKey(str, ref)
        if (exists) ref = ref[str]
        else if (i === path.length - 1) {
            console.error(`Final path key not found: ${str}`, path, ref, baseObject)
            return
        }
    }

    if (opts.output === 'info') return { value: ref, exists }
    else return ref
}


export const setFromPath = (path: PathFormat, value: any, ref:any, opts: any = {}) => {
    const create = opts?.create ?? false
    const keySeparator = opts?.keySeparator ?? standards.keySeparator

    if (typeof path === 'string') path = path.split(keySeparator)
    else if (typeof path == 'symbol') path = [path]
    path = [...path]

    const copy = [...path]
    const last = copy.pop() as string | symbol
    for (let i = 0; i < copy.length; i++) {
        const str = copy[i]  
        let has = hasKey(str, ref)
        
        // Create if not found
        if (create && !has) {
            ref[str] = {}
            has = true
        }

        // Swap reference
        if (has) ref = ref[str]

        // Throw error if not found
        else {
            const message = `Could not set path`
            console.error(message, path)
            throw new Error(message)
        }

        // Transfer to ESComponents automatically (if not second-to-last key...)
        if (ref.esComponents) ref = ref.esComponents 
    }

    ref[last] = value
}