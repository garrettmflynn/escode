

export const performance = async (callback, args) => {
    
    const tic = globalThis.performance.now()
    const output = await callback(...args)
    const toc = globalThis.performance.now()
    
    return {
        output,
        value: toc - tic
    }
}