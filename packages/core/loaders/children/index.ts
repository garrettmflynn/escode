import { specialKeys } from "../../../../spec/standards"

export const name = 'children'

export const required = false // Only applied if children

const key = specialKeys.children

export const properties = {
    dependents: [key]
}

const childrenLoader = ( esc ) => {

    const val = esc[key]

    console.error('Add children loader!', val)
    Object.defineProperty(esc, key, {
        value: val,
        enumerable: false,
        configurable: false,
        writable: false
    })    

    return esc
}


export default childrenLoader