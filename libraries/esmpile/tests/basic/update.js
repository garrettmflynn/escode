export let nExecution = 0
export let esmOnly = 0
export let forwarded = undefined

// Implicit Variables
// - delayId

export default function ( ) {

    if (this.delayId) clearTimeout(this.delayId)

    // Set Global and Scoped Variable
    this.nExecution++

    this.delayId = setTimeout(() => esmOnly = this.nExecution, 500)

}