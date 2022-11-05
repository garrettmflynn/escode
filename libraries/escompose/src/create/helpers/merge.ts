type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]

// Standard Notation
import { specialKeys } from "../../../../esc/standards"

// Utilities
import { resolve, merge as mergeUtility } from "../../utils"

// Helpers
import compile from './compile'

export default function merge (base, esCompose: esComposeType = {}, path: any[] = [], opts: any = {}) {

    // Ensure esCompose is an array
    if (!Array.isArray(esCompose)) esCompose = [esCompose]

    // Merge nested esCompose objects
    let promise = resolve(esCompose.map(o => {
       const compiled = compile(o, opts) // Resolve from text if required
       return resolve(compiled, (compiled) => {

            let arr: any[] = [compiled]
            let target = compiled
            while (target[specialKeys.compose]) {
                const val = target[specialKeys.compose]
                delete target[specialKeys.compose]
                target = resolve(compile(val, opts)) // Resolve from text if required

                arr.push(target)
            }

            return arr
        })
    }))

    return resolve(promise, (clonedEsCompose) => {

        const flat = clonedEsCompose.flat();
        let merged = Object.assign({}, base);
        delete merged[specialKeys.compose];
        flat.forEach((toCompose) => {
            merged = mergeUtility(toCompose, merged, path);
        });

        return merged;

    })
}