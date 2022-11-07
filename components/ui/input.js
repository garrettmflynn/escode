
export const __element = 'input'  // default element

export const __attributes = {
    oninput: function (ev) {
        this.default({value: ev.target.value, _internal: true})
    }
}

export default function (input){

    let res;
    if (input?._internal) res = input.value
    else {
        this.__element.value = input?.value ?? input
        res = input
    }

    return res
}