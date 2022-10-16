
export let cases = {}

export default function (value) {
    if (typeof this.cases[value] === 'function') return this.cases[value].call(this)
    else return this.cases[value]
}