import { specialKeys } from "../../../esc/standards"

type NestedRecord = {
    name: string,
    ref: any,
    parent: any
}

// Get all nested components in an object by looking for graphscript properties
export function from (o) {
    const parent = o
    if (!parent || typeof parent !== 'object') return null
    let array = Object.entries(parent).map(([name,v]) => {
        const hasGraphScriptProperties = !name.includes(specialKeys.isGraphScript) && (v && typeof v === 'object') ? Object.keys(v).find((key) => key.includes(specialKeys.isGraphScript)) : false
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