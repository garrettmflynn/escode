import { isPathString } from '../utils'

// Standard Notation
import { specialKeys } from "../../../../../esc/standards"

// Utilities
import { resolve, merge as basicMerge } from "../../../utils/misc"

// Helpers
import compile from './compile'

type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]

// ------------ Composition Loader Function ------------
// This function is used to load the __compose property of an object
// -----------------------------------------------------
function compose(o, toApply, path, opts, updateOriginal=false) {

    
    o = basicMerge(o, toApply, path, updateOriginal); // basic merge

    o = compileAndMerge(o, o[specialKeys.compose], path, opts, true, updateOriginal) // Basic Composition Support

    return resolve(o, (o) => {

        // ------------------ Set __apply Properties on Composition ------------------
        const toApply = o[specialKeys.apply]
        const toApplyFlag = (toApply && (typeof toApply === 'object' || isPathString(toApply)))
        o = toApplyFlag ? compileAndMerge(o,toApply, path, opts, false, updateOriginal) : o // Reverse Composition Support
        return resolve(o)
    })
}

export default compose

// ------------ Merge Helper ------------
// This merge function is used to merge two objects together WHILE RESOLVING COMPONENTS THAT MUST BE COMPILED
// --------------------------------------
function compileAndMerge(properties, composition: esComposeType = {}, path: any[] = [], opts: any = {}, flipPrecedence=false, updateOriginal=false) {

    // Ensure __compose is an array
    if (!Array.isArray(composition)) composition = [composition]

    // Merge nested __compose objects
    let promise = resolve(composition.map(o => {
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

    return resolve(promise, (composition) => {

        const flat = composition.flat();

        let composed = {}

        flat.forEach((toCompose) => composed = basicMerge(
            composed, 
            toCompose, 
            path, 
            false, 
            false, 
            // true // NOTE: Would allow functions to be nested inside each other
        ));

        return basicMerge(
            properties, 
            composed, 
            path, 
            updateOriginal, 
            flipPrecedence, 
            // true
        );
    })
}