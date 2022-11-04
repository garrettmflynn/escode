export const getTopNode = (target) => {

    while (target.esParent && target.esParent.hasAttribute('__isescomponent')) {
        const component = target.esParent.esComponent
        if (component.esParent) target = component
        else break
    }

    return target.esElement
}