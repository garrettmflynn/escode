import global from './global'
import { ActiveInfo } from './types'

export const performance = async (callback, args) => {
    
    const tic = globalThis.performance.now()
    const output = await callback(...args)
    const toc = globalThis.performance.now()
    
    return {
        output,
        value: toc - tic
    }
}

const infoFunctions = {
    performance
}

export const get = async (func, args, info) => {

    let result = {
        value: { },
        output: undefined,
    } as {
        value: ActiveInfo,
        output: any
    }
    
    
    const infoToGet = {...global.info, ...info}

    for (let key in infoToGet)  {
        if (infoToGet[key] && infoFunctions[key]) {
            const ogFunc = func
            func = async (...args) => {
                const o = await infoFunctions[key](ogFunc, args)
                result.value[key] = o.value
                return o.output
            }   
        }
    }

    result.output = await func(...args)
    return result
}