type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]

import { deep } from "../../../../common/clone"
// Standard Notation
import { specialKeys } from "../../../../esc/standards"

// Utilities
import { resolve, merge as mergeUtility } from "../../utils"

// Helpers
import compile from './compile'

export default function merge (base, __compose: esComposeType = {}, path: any[] = [], opts: any = {}) {

    // Ensure __compose is an array
    if (!Array.isArray(__compose)) __compose = [__compose]

    // Merge nested __compose objects
    let promise = resolve(__compose.map(o => {
       const compiled = compile(o, opts) // Resolve from text if required

       const checkAndPushTo = (target, acc: any[] = [], forcePush = true) => {

        if (Array.isArray(target)) target.forEach(o => checkAndPushTo(o, acc), true)

        else if (target[specialKeys.compose]) { 

                acc.push(target)

                const val = target[specialKeys.compose]    
                delete target[specialKeys.compose]
                const newTarget = resolve(compile(val, opts)) // Resolve from text if required
                checkAndPushTo(newTarget, acc)
        }
        else if (forcePush) acc.push(target)

        return acc
       }
       
       return resolve(compiled, (compiled) => checkAndPushTo(compiled))
    }))

    return resolve(promise, (clonedEsCompose) => {

        const flat = clonedEsCompose.flat();
        let merged = Object.assign({}, base);
        // delete merged[specialKeys.compose];
        flat.forEach((toCompose) => {
            merged = mergeUtility(toCompose, merged, path);
        });

        return merged;

    })
}