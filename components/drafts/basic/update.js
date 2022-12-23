export let nExecution = 0
export let esmOnly = 0
export let passedWithListener = undefined

// Variables Added Later
// - delayId

export default function () {

    if (this.delayId) clearTimeout(this.delayId)

    // Set Global and Scoped Variable
    this.nExecution++

    setTimeout(() => {
        this.later = true
    }, 1000)

    this.delayId = setTimeout(() => esmOnly = this.nExecution, 500)

}