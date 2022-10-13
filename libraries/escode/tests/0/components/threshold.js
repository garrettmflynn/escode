export let threshold = 1.0

export default function (input) {
    return Math.abs(input) > this.threshold
}