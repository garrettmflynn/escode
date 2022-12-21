// Utilities
import { resolve, merge as basicMerge } from "../../utils"

// Helpers
import compile from './compile'
import { esSourceKey, specialKeys } from '../../../../esc/standards'

type anyObj = {[key: string]: any}
type esComposeType = anyObj | anyObj[]


export const name = 'compose'

const localSpecialKeys = {
    compose: specialKeys.compose,
    apply: specialKeys.apply,

    // Added with library
    bundle: esSourceKey
}

export const properties = {
    dependents:  Object.values(localSpecialKeys),
}

const isPathString = (value) => typeof value === 'string' && (value.includes('/') || value.includes('.'))

// ------------ Composition Loader Function ------------
// This function is used to load the __compose property of an object
// -----------------------------------------------------
function compose(o, toApply, opts, updateOriginal=false) {
    
    o = basicMerge(o, toApply, updateOriginal); // basic merge

    o = compileAndMerge(o, o[localSpecialKeys.compose], opts, true, updateOriginal) // Basic Composition Support

    return resolve(o, (o) => {

        // ------------------ Set __apply Properties on Composition ------------------
        const toApply = o[localSpecialKeys.apply]
        const toApplyFlag = (toApply && (typeof toApply === 'object' || isPathString(toApply)))
        o = toApplyFlag ? compileAndMerge(o,toApply, opts, false, updateOriginal) : o // Reverse Composition Support
        return resolve(o)
    })
}

export default compose

// ------------ Merge Helper ------------
// This merge function is used to merge two objects together WHILE RESOLVING COMPONENTS THAT MUST BE COMPILED
// --------------------------------------
function compileAndMerge(properties, composition: esComposeType = {}, opts: any = {}, flipPrecedence=false, updateOriginal=false) {

    // Ensure __compose is an array
    if (!Array.isArray(composition)) composition = [composition]

    // Merge nested __compose objects
    let promise = resolve(composition.map(o => {
       const compiled = compile(o, opts) // Resolve from text if required

       const checkAndPushTo = (target, acc: any[] = [], forcePush = true) => {

        if (Array.isArray(target)) target.forEach(o => checkAndPushTo(o, acc), true)

        else if (target[localSpecialKeys.compose]) { 

                acc.push(target)

                const val = target[localSpecialKeys.compose]    
                delete target[localSpecialKeys.compose]
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
            false, 
            false, 
            // true // NOTE: Would allow functions to be nested inside each other
        ));

        return basicMerge(
            properties, 
            composed, 
            updateOriginal, 
            flipPrecedence, 
            // true
        );
    })
}