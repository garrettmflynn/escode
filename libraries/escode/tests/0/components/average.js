export let threshold = 1.0

export default function (input) {
    if (!Array.isArray(input)) input = [input]
    return input.reduce((a,b) => a + b, 0) / input.length
}