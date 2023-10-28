import { drillSimple, abortSymbol } from "../common/drill"
import { specialKeys } from "../../../spec/properties"
import { isNativeClass } from "../common/utils"

type NestedRecord = {
    name: string,
    ref: any,
    parent: any
}

export const is = (key) => {
    return key.includes(specialKeys.root) || key === 'default'
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

        // Ignore ES root property and other properties that may have nested ES properties
        ignore: ['__', '__parent', '__compose', '__apply'],

        // Avoid drilling elements...
        condition: (_, o) => {
            const thisName = o?.constructor?.name
            const propName = o?.__props?.constructor?.name
            return (!basicObjects.includes(thisName) && !!globalThis[thisName]) || !!globalThis[propName] ? false : true
        }
    })

    return has as false | string[]
}

// Get all nested components in an object by looking for ES properties
export function from (parent) {

    if (!parent || typeof parent !== 'object') return null

    let array = Object.entries(parent).map(([name,ref]) => {
        
        const mayBeComponent = ref && typeof ref === 'object' || typeof ref === 'function'
        if (!mayBeComponent) return

        const hasESProperties = !name.includes(specialKeys.root) ? Object.keys(ref).find(is) : false
        if (hasESProperties) {
            if (name === 'constructor' && isNativeClass(ref)) return // Don't consider componentized classes as components on their instances...
            return { ref, parent, name } as NestedRecord
        }
    }).filter((v) => v && v.ref) as NestedRecord[]
    
    let hasProperties = array.length > 0

    // // NOTE: This is an important feature to have if we don't keep the __children property
    // // This makes sure that nested components have ES properties
    // if (!hasProperties) {
    //     const found = has(parent)
    //     if (found) {
    //         const sliced = found.slice(0, -2)
    //         let target = parent
    //         sliced.forEach(str=> {
    //             target = target[str]
    //             target.__ = true // Force recognition as a component
    //         })
    //         const name = found[0]
    //         array = [{
    //             ref: parent[name],
    //             parent,
    //             name
    //         }]
    //         hasProperties = true
    //     }
    // }

    if (hasProperties) return array
    else return null
}