
import mergeHelper from './merge'
import createComponent from "../../create/index"

// Standard Notation
import { specialKeys, keySeparator } from "../../../../esc/standards"

// Utilities
import { resolve, merge as mergeUtility } from "../../utils"

// Types
import { Options } from '../../../../common/types'
import { isPathString } from './utils'


export const merge = (o, toApply, path, opts, updateOriginal=false) => {

    o = mergeUtility(toApply, o, path, updateOriginal); // basic merge
    o = mergeHelper(o, o[specialKeys.compose], path, opts, false, updateOriginal) // Basic Composition Support

    return resolve(o, (o) => {

        // ------------------ Set __apply Properties on Composition ------------------
        const toApply = o[specialKeys.apply]
        const toApplyFlag = (toApply && (typeof toApply === 'object' || isPathString(toApply)))
        o = toApplyFlag ? mergeHelper(toApply, o, path, opts, true, updateOriginal) : o // Reverse Composition Support
        return resolve(o)
    })
}

// TODO: Ensure that this doesn't have a circular reference
export default function hierarchy(o, id: string | symbol, toApply = {}, parent?, directParent?, opts: Partial<Options> = {}, callbacks: any = {}, waitForChildren: boolean = false) {

    const parentId = parent?.[specialKeys.path]
    const path = (parentId) ? [parentId, id] : ((typeof id === 'string') ? [id] : [])

    // TODO: Search the entire object for the __compose key. Then execute this merge script
    // ------------------ Create Composition from ESM with __compose Properties ------------------
    o = merge(o, toApply, path, opts)
   
    return resolve(o, (o) => {

        // delete applied[specialKeys.compose]

        // ------------------ Create Instance with Special Keys ------------------
        const instance = createComponent(id, o, parent, opts)
        const absolutePath = path.join(opts.keySeparator ?? keySeparator)
        if (directParent) directParent[id] = instance // setting immediately

        if (callbacks[id]) callbacks[id](instance)
        if (callbacks.onInstanceCreated) callbacks.onInstanceCreated(absolutePath, instance)

        // ------------------ Convert Nested Components ------------------
        const isReady = () => {
            if (callbacks.onInstanceReady) callbacks.onInstanceReady(absolutePath, instance)
        }

        if (instance[specialKeys.hierarchy]) {

            let positions = new Set()
            let position = 0;

            const promises = Object.entries(instance[specialKeys.hierarchy]).map(async ([name, base]: [string, any], i) => {

                base = Object.assign({}, base) // Break ESM reference (to write a childPosition property)

                const pos = base[specialKeys.childPosition]
                if (pos !== undefined) {
                    if (positions.has(pos)) console.warn(`[escompose]: Duplicate ${specialKeys.childPosition} value of ${pos} found in ${name} of ${instance[specialKeys.path]}`)
                    else positions.add(pos)
                }
                else {
                    while (positions.has(position)) position++ // find next available position
                    base[specialKeys.childPosition] = position; // specify child position
                    positions.add(position)
                }


                const promise = hierarchy(base, name, undefined, instance, instance[specialKeys.hierarchy], opts, callbacks, true); // converting from top to bottom
                Object.defineProperty(instance[specialKeys.hierarchy][name], specialKeys.promise, {
                    value: promise,
                    writable: false,
                })

                return resolve(promise)

            })

            // When All Children are Initialized
            const res = resolve(promises, (resolved) => {
                isReady()
                return resolved
            })

            if (waitForChildren) return resolve(res, () => instance)
        } else isReady()

        return instance
    })

}