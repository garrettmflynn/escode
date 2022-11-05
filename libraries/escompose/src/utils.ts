const isPromise = (o) => typeof o === 'object' && typeof o.then === 'function'

// Resolve if promise or object
export const resolve = (object, callback?) => {

    // can resolve arrays with promises
    if (typeof object === 'object' && Array.isArray(object) && object.find(v => isPromise(v))) object = Promise.all(object)

    // resolves with or without callback 
    if (isPromise(object)) {
        return new Promise(resolvePromise => {
            object.then(async (res) => {
                const output = (callback) ? callback(res) : res
                resolvePromise(output)
            })
        })
    } else {
        return (callback) ? callback(object) : object
    }
}

// Merge individual object keys AND nest functions to maintain their bindings

export const merge = (main, override, path: any[] = []) => {

    const copy = Object.assign({}, main) // choose to copy
    if (override){

        const keys = Object.keys(copy)
        const newKeys = new Set(Object.keys(override))

        keys.forEach(k => {
            newKeys.delete(k)

            const thisPath = [...path, k]

            // Merge individual object keys
            if (typeof override[k] === 'object' && !Array.isArray(override[k])) {
                if (typeof copy[k] === 'object') copy[k] =  merge(copy[k], override[k], thisPath)
                else copy[k] = override[k]
            } 

            // Nest functions
            else if (typeof override[k] === 'function') {

                const original = copy[k]
                const isFunc = typeof original === 'function'
                if (isFunc && !original.functionList) original.functionList = [original]

                const newFunc = override[k]
                if (!isFunc) copy[k] = newFunc
                else if (!original.functionList.includes(newFunc)) {
                    const func = copy[k] = function(...args) {
                        original.call(this, ...args);
                        return newFunc.call(this, ...args);
                    } as Function & {functionList?: Function[]}

                    if (!func.functionList) func.functionList = [original]
                    func.functionList.push(override)
                } else console.warn(`This function was already merged into ${thisPath.join('.')}. Ignoring duplicate.`)

            }
            
            // Replace values and arrays
            else if (k in override) copy[k] = override[k]
        })

        newKeys.forEach(k => copy[k] = override[k])
    }

    return copy // named exports
}