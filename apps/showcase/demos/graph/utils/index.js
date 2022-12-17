export const getTopNode = (target) => {

    while (target.__parent && '__' in target.__parent) {
        const component = target.__parent
        if (component.__parent) target = component
        else break
    }

    return target.__element
}