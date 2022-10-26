// Merge individual object keys AND nest functions to maintain their bindings

export const merge = (main, override) => {

    const copy = Object.assign({}, main) // choose to copy
    if (override){

        const keys = Object.keys(copy)
        const newKeys = new Set(Object.keys(override))

        keys.forEach(k => {
            newKeys.delete(k)

            // Merge individual object keys
            if (typeof override[k] === 'object' && !Array.isArray(override[k])) {
                if (typeof copy[k] === 'object') copy[k] =  merge(copy[k], override[k])
                else copy[k] = override[k]
            } 

            // Nest functions
            else if (typeof override[k] === 'function') {

                const original = copy[k]
                copy[k] = function (...args) {
                    if (typeof original === 'function') original.call(this, ...args) // TODO: See if there is a more performant way to do this
                    override[k].call(this, ...args)
                }
            }
            
            // Replace values and arrays
            else if (k in override) copy[k] = override[k]
        })

        newKeys.forEach(k => copy[k] = override[k])
    }
    
    return copy // named exports
}