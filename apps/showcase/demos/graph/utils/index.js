export const getTopNode = (target) => {

    while (target.esParent && target.esParent.hasAttribute('escomponent')) {
        const component = target.esParent.esComponent
        if (component.esParent) target = component
        else break
    }

    return target.esElement
}