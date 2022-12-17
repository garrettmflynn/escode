const pathLoader = (keys, base, id, opts, parent?) => {

    parent = (parent instanceof Element ? parent?.[keys.component] : parent) ?? base[keys.parent]

    const hasParent = parent[keys.isGraphScript]
        
    const isESC = {value: '', enumerable: false, writable: true} as any

    if (hasParent){
        if (typeof id === 'string') {
            const path = parent[keys.path]
            if (path) isESC.value = [path, id]
            else isESC.value = [id]
            isESC.value = isESC.value.join(opts.keySeparator)
        }
    }

    Object.defineProperty(base, keys.path, isESC)    

}


export default pathLoader