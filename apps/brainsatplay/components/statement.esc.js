export function __onconnected () {
    if (this.header !== undefined) this.container.header.__element.innerText = this.header
    if (this.text !== undefined) this.container.text.__element.innerHTML = this.text
}


export const container = {
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