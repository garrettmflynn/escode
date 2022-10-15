const merge = (main, override) => { //, writeToMain=false) => {

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

export default merge