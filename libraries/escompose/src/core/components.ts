import { specialKeys } from "../../../esc/standards"

type NestedRecord = {
    name: string,
    ref: any,
    parent: any
}

// Get all nested components in an object by looking for graphscript properties
export function from (o) {
    const parent = o

    if (!parent || typeof o !== 'object') return null

    let array = Object.entries(parent).map(([name,v]) => {

        const mayBeComponent = typeof parent === 'object' || typeof parent === 'function'

        const hasGraphScriptProperties = !name.includes(specialKeys.isGraphScript) && (v && mayBeComponent) ? Object.keys(v).find((key) => key.includes(specialKeys.isGraphScript) || key === 'default') : false
        if (hasGraphScriptProperties) {
            return {
                ref: v,
                parent,
                name
            } as NestedRecord
        }
    }).filter((v) => v && v.ref) as NestedRecord[]
    
    if (array.length === 0) return null
    else return array
}