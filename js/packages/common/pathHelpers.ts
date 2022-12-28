import { PathFormat, SetValueOptions } from "../esmonitor/src/types"
import * as standards from '../../../spec/properties'
import { deep } from "./clone"

const hasKey = (key, obj) =>  key in obj


const getShortcut = (path, shortcuts, keySeparator) => {
    const sc = shortcuts[path[0]]
    if (sc) {
        const value = sc[path.slice(1).join(keySeparator)]
        if (value) return value
    }
}

export const getFromPath = (baseObject, path, opts: any = {}) => {


    const fallbackKeys = opts.fallbacks ?? []
    const keySeparator = opts.keySeparator ?? standards.keySeparator

    if (opts.shortcuts) {
        const shortcut = getShortcut(path, opts.shortcuts, keySeparator)
        if (shortcut) {
            if (opts.output === 'info') return { value: shortcut, exists: true, shortcut: true }
            else return shortcut
        }
    }


    if (typeof path === 'string') path = path.split(keySeparator).flat()
    else if (typeof path == 'symbol') path = [path]

    let exists;
    path = [...path]

    path = path.map(o => (typeof o === "string") ? o.split(keySeparator) : o).flat()


    let ref =  baseObject
    const chain = [ref]
    
    for (let i = 0; i < path.length; i++) {

        if (ref) {

            const str = path[i]
            
            // Try Standard Path
            exists = hasKey(str, ref)

            if (exists) ref = ref[str]
            else {
                ref = undefined
                exists = true
            }

            chain.push(ref)
        }
    }

    if (opts.output === 'info') return { value: ref, exists,  parent: chain[chain.length - 2] }
    else return ref
}


export const setFromPath = (path: PathFormat, value: any, ref:any, opts: SetValueOptions = {}) => {
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
    }

    ref[last] = value

    return true
}