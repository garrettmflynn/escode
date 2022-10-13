

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
