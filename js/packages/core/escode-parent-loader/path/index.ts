import { Options } from "../../../common/types"
import { keySeparator, specialKeys } from "../../../../../spec/properties"
import { isNode } from "../../../common/globals"

export const name = 'path'

export const required = true

export const properties = {
    dependencies: [
        specialKeys.root,
        specialKeys.parent,
    ],
    dependents: []
}

const Element = globalThis.Element

const pathLoader = ( esc ) => {

    // Specify the current path of the object        
    const configuration = esc[specialKeys.root]
    let parent = esc[specialKeys.parent]
    const name = configuration.name // Grab name from the configuration

    parent = ( (!isNode && parent instanceof globalThis.Element) ? parent?.[specialKeys.component] : parent) ?? esc[specialKeys.parent]

    const isESC = { value: '', writable: true } as any

    if (parent) {
        const parentComponentConfiguration = parent[specialKeys.root]
            
        if (parentComponentConfiguration){
            if (typeof name === 'string') {
                let target = parent
                const path: string[] = []
                while (target && target[specialKeys.root]) {
                    const parentName = target[specialKeys.root].name
                    if (typeof parentName === 'string') path.push(parentName)
                    else {
                        if (typeof parentName === 'symbol') configuration.root = parentName
                        else console.error('No graph reset occured for', parentName)
                        break
                    }
                    target = target[specialKeys.parent]
                }
                isESC.value = [...path.reverse(), name]
                isESC.value = isESC.value.join(keySeparator)
            }
        }
    }

    Object.defineProperty(configuration, 'path', isESC)    
}


export default pathLoader