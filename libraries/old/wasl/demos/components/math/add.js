export const toAdd = 1
export default function (input) {
    const res = input + this.toAdd
    console.log(`Adding ${input} + ${this.toAdd} =`, res)
    return res
}