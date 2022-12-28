import { specialKeys } from "../../../../spec/properties"

export const name = 'operator'

export const required = true

export const properties = {
    dependents: [specialKeys.operator]
}

function checkIfBothOperators(nested) {
    if (nested[specialKeys.operator]){
        const root = nested[specialKeys.root]
        const parentRoot = this[specialKeys.root]
        const rootComponent = parentRoot.get(parentRoot.root)
        rootComponent.listeners.add(parentRoot.path, root.path)
    }
}

const activate = (esc) => {
    esc[specialKeys.root].components.onAdded((o) => checkIfBothOperators.call(esc, o))
    esc[specialKeys.root].operator.active = true
}

const operatorLoader = ( esc ) => {

    const root = esc[specialKeys.root]
    root.operator = {
        active: false
    }
    let val = esc[specialKeys.operator]

    if (val) activate(esc)

    // Setting this creates recursion...
    // Object.defineProperty(esc, specialKeys.operator, {
    //    get: () => val,
    //    set: (fn) => {
    //         val = fn
    //         esc[specialKeys.root].components.forEach((o) => checkIfBothOperators.call(esc, o))
    //         if (!root.operator.active) activate(esc)
    //    }
    // })

    return esc
}


export default operatorLoader