// Element Specification
export const tagName = 'input'
export const attributes = {
    placeholder: 'Insert text here',
    oninput: function (ev) {
        this.default({value: ev.target.value, _internal: true})
    }
}

export default function (input){

    if (input?._internal) return input.value
    else {
        this.element.value = input?.value ?? input
        return input
    }
}