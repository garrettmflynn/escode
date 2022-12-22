import { Options } from "../../../../../common/types"
import { specialKeys } from "../../../../../esc/standards"
import { isNode } from "../../../globals"

export const name = 'path'

export const required = true

export const properties = {
    dependencies: [
        specialKeys.isGraphScript,
        specialKeys.parent,
    ],
    dependents: []
}

const pathLoader = ( esc, _, opts: Partial<Options>={}) => {

    // Specify the current path of the object        
    const configuration = esc[specialKeys.isGraphScript]
    let parent = esc[specialKeys.parent]
    const name = configuration.name // Grab name from the configuration

    parent = ( (!isNode && parent instanceof Element) ? parent?.[specialKeys.component] : parent) ?? esc[specialKeys.parent]

    const isESC = { value: '', writable: true } as any

    if (parent) {
        const parentComponentConfiguration = parent[specialKeys.isGraphScript]
            
        if (parentComponentConfiguration){
            if (typeof name === 'string') {
                let target = parent
                const path: string[] = []
                while (target && target[specialKeys.isGraphScript]) {
                    const name = target[specialKeys.isGraphScript].name
                    if (typeof name === 'string') path.push(name)
                    else break;
                    target = target[specialKeys.parent]
                }
                isESC.value = [...path.reverse(), name]
                isESC.value = isESC.value.join(opts.keySeparator ?? '.')
            }
        }
    }

    Object.defineProperty(configuration, 'path', isESC)    
}


export default pathLoader