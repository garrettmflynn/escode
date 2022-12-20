import { Options } from "../../../../common/types"
import { specialKeys } from "../../../../esc/standards"

export const properties = {
    dependencies: [
        specialKeys.isGraphScript,
        specialKeys.parent,
    ],
    dependents: []
}

const pathLoader = ( esc, toApply={}, opts: Partial<Options>={}) => {

    const configuration = esc[specialKeys.isGraphScript]
    let parent = toApply[specialKeys.parent]
    const id = toApply[specialKeys.isGraphScript]?.path ?? configuration.path // Use an existing path as the id

    parent = (parent instanceof Element ? parent?.[specialKeys.component] : parent) ?? esc[specialKeys.parent]

    const parentComponentConfiguration = parent[specialKeys.isGraphScript]
        
    const isESC = {value: '', enumerable: false, writable: true} as any

    if (parentComponentConfiguration){
        if (typeof id === 'string') {
            const path = parentComponentConfiguration.path
            if (path) isESC.value = [path, id]
            else isESC.value = [id]
            isESC.value = isESC.value.join(opts.keySeparator ?? '.')
        }
    }

    Object.defineProperty(configuration, 'path', isESC)    

}


export default pathLoader