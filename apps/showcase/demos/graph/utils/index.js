export const getTopNode = (target) => {

    while (target.__parent && target.__parent.hasAttribute('escomponent')) {
        const component = target.__parent.__component
        if (component.__parent) target = component
        else break
    }

    return target.__element
}