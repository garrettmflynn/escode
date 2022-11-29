const pathLoader = (keys, base, id, opts, parent?) => {

    const hasParent = (parent?? base[keys.parent])?.[keys.component]
    const isESC = {value: '', enumerable: false, writable: true} as any

    if (hasParent){
        if (typeof id === 'string') {
            const path = hasParent[keys.path]
            if (path) isESC.value = [path, id]
            else isESC.value = [id]
            isESC.value = isESC.value.join(opts.keySeparator)
        }
    }

    Object.defineProperty(base, keys.path, isESC)    

}


export default pathLoader