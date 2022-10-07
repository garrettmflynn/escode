import { toResolve } from './dependency.js'
import * as o from './dependency.js'
const original = toResolve ? JSON.parse(JSON.stringify(toResolve)) : toResolve
export let nExecution = 0

export default ( ) => {
    nExecution++
    console.log(`original`, original)
    console.log(`namespace`, o.toResolve)
    console.log(`named`, toResolve)
    console.log(`nExecution`, nExecution)

    return o.toResolve === toResolve
}