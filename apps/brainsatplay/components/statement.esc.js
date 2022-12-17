export function __onconnected () {
    if (this.header !== undefined) this.__children.header.__element.innerText = this.header
    if (this.text !== undefined) this.__children.text.__element.innerHTML = this.text
}

export const __children = {
    header: {
        __element: 'h3',
        __attributes: {
            innerText: 'Header'
        }
    },
    text: {
        __element: 'p',
        __attributes: {
            innerHTML: 'This is the text.'
        }
    }
}