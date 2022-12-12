type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]

// ------------ Merge ------------
// This merge function is used to merge two objects together WHILE RESOLVING COMPONENTS THAT MUST BE COMPILED
// -------------------------------


// Standard Notation
import { specialKeys } from "../../../../esc/standards"

// Utilities
import { resolve, merge as mergeUtility } from "../../utils"

// Helpers
import compile from './compile'

export default function merge (base, toComposeWith: esComposeType = {}, path: any[] = [], opts: any = {}, reverse=false, updateOriginal=false) {

    let [toCompile, alreadyResolved] = (reverse) ? [base, toComposeWith] : [toComposeWith, base]

    // Ensure __compose is an array
    if (!Array.isArray(toCompile)) toCompile = [toCompile]

    // Merge nested __compose objects
    let promise = resolve(toCompile.map(o => {
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

    return resolve(promise, (compiled) => {

        const flat = compiled.flat();
        if (reverse) return mergeUtility(alreadyResolved, Object.assign({}, flat[0]), path);
        else {
            let merged = (updateOriginal) ? base : Object.assign({}, base)
            flat.forEach((toCompose) => merged = mergeUtility(toCompose, merged, path, updateOriginal));
            return merged;
        }
    })
}