export function __onconnected () {
    if (this.header !== undefined) this.header.__element.innerText = this.header
    if (this.text !== undefined) this.text.__element.innerHTML = this.text
}


export const header = {
    __element: 'h3',
    __attributes: {
        innerText: 'Header'
    }
}

export const text = {
    __element: 'p',
    __attributes: {
        innerHTML: 'This is the text.'
    }
}