import * as path from '../common/utils/path'
import * as languages from '../common/utils/languages'

export const isSrc = (str) => {
    return typeof str === 'string' && Object.values(languages).find(arr => arr.includes(str.split('.').slice(-1)[0])) // Has supported extension
}

export const merge = (main, override) => { //, writeToMain=false) => {

    const copy = Object.assign({}, main) // choose to copy
    if (override){

        const keys = Object.keys(copy)
        const newKeys = new Set(Object.keys(override))

        keys.forEach(k => {
            if (k === 'channels') copy[k] = Object.assign({}, copy[k])
            newKeys.delete(k)
            if (typeof override[k] === 'object' && !Array.isArray(override[k])) {
                if (typeof copy[k] === 'object') copy[k] =  merge(copy[k], override[k])
                else copy[k] = override[k]
            } else if (k in override) copy[k] = override[k] // replace values and arrays
        })

        newKeys.forEach(k => {
            copy[k] = override[k]
        })
    }
    
    return copy // named exports
}

export const checkFiles = (key, filesystem) => {
    const isJSON = path.suffix(key).slice(-4) === "json" ? true : false;
    const output = isJSON && filesystem[key] ? JSON.parse(JSON.stringify(filesystem[key])) : filesystem[key];
    return output;
}

export var remove = (original, search, key=original, o?, message?)=> {
    if (message) console.error(message)
    else console.error(`Source was not ${original ? `resolved for ${original}` : `specified for ${key}`}. ${search ? `If available, refer to this object directly as options.filesystem["${search}"]. ` : ''}${o ? `Automatically removing ${key} from the ESC file.` : ''}`);
    if (o) delete o[key];
  }
