import { drillSimple, abortSymbol } from "../../../common/drill"
import { specialKeys } from "../../../esc/standards"

type NestedRecord = {
    name: string,
    ref: any,
    parent: any
}

export const is = (key) => {
    return key.includes(specialKeys.isGraphScript) || key === 'default'
}

const basicObjects = ['Object', 'Array']

export const has = (o) => {
    let has = false
    drillSimple(o, (key, val, info) => {
        if (info.path.length > 1){
            const found = info.path.find(str => str === '__')
            if (!found && is(key)) {
                has = info.path
                return abortSymbol
            }
        }
    }, {

        // Ignore graphscript properties
        ignore: ['__'],

        // Avoid drilling elements...
        condition: (_, o) => {
            const thisName = o?.constructor?.name
            const propName = o?.__props?.constructor?.name
            return (!basicObjects.includes(thisName) && !!globalThis[thisName]) || !!globalThis[propName] ? false : true
        }
    })

    return has as false | string[]
}

// Get all nested components in an object by looking for graphscript properties
export function from (parent) {

    if (!parent || typeof parent !== 'object') return null

    let array = Object.entries(parent).map(([name,v]) => {
        
        const mayBeComponent = typeof parent === 'object' || typeof parent === 'function'

        const hasGraphScriptProperties = !name.includes(specialKeys.isGraphScript) && (v && mayBeComponent) ? Object.keys(v).find(is) : false
        if (hasGraphScriptProperties) {
            return {
                ref: v,
                parent,
                name
            } as NestedRecord
        }
    }).filter((v) => v && v.ref) as NestedRecord[]
    
    let hasProperties = array.length > 0

    // NOTE: This is an important feature to have if we don't keep the __children property
    // This makes sure that nested components have graphscript properties
    if (!hasProperties) {
        const found = has(parent)
        if (found) {
            const sliced = found.slice(0, -2)
            let target = parent
            sliced.forEach(str=> {
                target = target[str]
                target.__ = true // Force recognition as a component
            })
            const name = found[0]
            array = [{
                ref: parent[name],
                parent,
                name
            }]
            hasProperties = true
        }
    }

    if (hasProperties) return array
    else return null
}