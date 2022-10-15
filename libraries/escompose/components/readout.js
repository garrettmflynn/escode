export let nExecutions = 0

export const tagName = 'span'

export default function(...data){ // actually uses this.increment
    this.esElement.innerText = data
}