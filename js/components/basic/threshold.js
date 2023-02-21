export let value = 1.0

export default function (input) {
    console.log('input', input)

    return Math.abs(input) > this.value
}