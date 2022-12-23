import { shallow } from "../clone"
import { all } from "../properties"

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

// ------------ Merge ------------
// Merge individual object keys AND nest functions to maintain their bindings
// -------------------------------


const functionRegistry: {
    f: Function,
    list: Function[]
}[] = []

export const merge = (
    main, 
    override, 
    updateOriginal: boolean = false, // choose to update original
    flipPrecedence: boolean = false, // flip precedence of merge
    composeFunctions: boolean = false, // use composition on functions
    seen: any[]=[], // for circular references
) => {

    let copy = (updateOriginal) ? main : shallow(main) // choose to copy

    if (flipPrecedence) [copy, override] = [override, copy]


    if (override){

        const keys = all(copy)
        const newKeys = new Set(all(override))

        keys.forEach(k => {
            newKeys.delete(k)

            const exists = k in override
            const newValue = override[k]
            if (exists && newValue === undefined)  delete copy[k] // delete if undefined

            // Merge individual object keys
            else if (typeof newValue === 'object' && !Array.isArray(newValue)) {

                    // Track seen so you don't drill infinitely on circular references
                    if (typeof copy[k] === 'object') {
                        const val = copy[k]
                        const idx = seen.indexOf(val)
                        if (idx !== -1) copy[k] = seen[idx]
                        else {
                            seen.push(val)
                            copy[k] =  merge(val, newValue, updateOriginal, false, composeFunctions, seen)
                        }
                    }
                    else copy[k] = newValue
            } 

            // Nest functions
            else if (typeof newValue === 'function') {

                const original = copy[k]
                const isFunc = typeof original === 'function'

                const newFunc = newValue
                const composeFunction = newFunc.__compose === true

                // Direct Function Replacement
                if (!isFunc || (!composeFunctions && !composeFunction)) copy[k] = newFunc
                
                // Function Composition
                else {
                    let funcList = functionRegistry.find(o => o.f === original)

                    let ogFunc = original
                    if (!funcList) {
                        if (ogFunc.__esInspectable) ogFunc = ogFunc.__esInspectable.target // Don't trigger proxies that have been updated
                        funcList = {f: ogFunc, list: [ogFunc]}
                        functionRegistry.push(funcList)
                    }

                    if (!funcList.list.includes(newFunc)) {
                        const func = copy[k] = function(...args) {
                            const res = ogFunc.call(this, ...args);
                            return newFunc.call(this, ...Array.isArray(res) ? res : [res]);
                        } as Function & {__functionList?: Function[]}

                        funcList.f = func
                        funcList.list.push(newFunc)
                    } 
                    else console.warn(`This function was already composed. Ignoring duplicate.`)
                }

            }
            
            // Replace values and arrays
            else if (k in override) copy[k] = newValue
        })


        newKeys.forEach(k => {
            const newValue = override[k]
            if (newValue === undefined) return
            else copy[k] = newValue
        })
    }

    return copy // named exports
}

export function isNativeClass (thing) {
    return isFunction(thing) === 'class'
}


export function isFunction(x) {
    const res = typeof x === 'function'
        ? x.prototype
            ? Object.getOwnPropertyDescriptor(x, 'prototype').writable
                ? 'function'
                : 'class'
        : x.constructor.name === 'AsyncFunction'
        ? 'async'
        : 'arrow'
    : '';

    return res
}
