export let nExecutions = 0

export default function(){
    this.nExecutions++
    return this.nExecutions
}