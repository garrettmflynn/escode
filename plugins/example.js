export let nExecutions = 0

setTimeout(() => {
    nExecutions++
}, 500)

export default function(){
    this.nExecutions++
    return this.nExecutions
}