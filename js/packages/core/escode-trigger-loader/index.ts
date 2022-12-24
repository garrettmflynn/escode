import { specialKeys } from "../../../../spec/properties"

export const name = 'trigger'

const key = specialKeys.trigger

export const properties = {
    dependents: [key],
    dependencies: [specialKeys.listeners.value]
}

const triggerLoader = ( esc ) => {

    let val = esc[key]
    const hasKey = key in esc

    if (hasKey){

        Object.defineProperty(esc, key, {
            value: val,
            enumerable: false,
            configurable: false,
            writable: false
        })    


        // configuration.start.add(() => { })
        if (!Array.isArray(val)) val = [val]
        esc[specialKeys.listeners.value].onStart(() => esc.default(...val), esc[specialKeys.root].root)
        return esc
    }
}


export default triggerLoader
