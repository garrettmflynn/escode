export let value;
export let strict = false

export default function (input) {
    if (this.strict) return input === this.value
    else return input == this.value
}