import * as onElementUtils from '../onElement.js'

export const observer = undefined

const style = `

    .escode-switch-component {
        padding: 10px;
    }

    .escode-switch-component > fieldset{
        border-radius: 10px;
        padding: 15px;
        border: 2px solid;
        width: fit-content;
        position: relative;
    }

    .escode-switch-component > fieldset > legend {
        line-height: 0px;
        font-weight: bold;
    }

    .escode-switch-component sub {
        font-size: 70%;
        margin-left: 2px;
    }
`

export const elements = {}


export function esConnected() {

    onElementUtils.start.call(this, {
        stylesheet: style,
        callback: this.register,
        type: 'interactive'
    })

}

export function esDisconnected () {
    onElementUtils.stop.call(this)

    // Remove framing elements
    for (let id in this.elements) {
        const el = this.elements[id]
        const container = el.parentNode?.parentNode
        if (container){
            container.parentNode.appendChild(el, container)
            container.remove()
        }
    }
}


export const count = 1

export function register(el) {

    // Track Element
    const id = this.count
    this.elements[id] = el

    // Label Element
    const div = document.createElement('div')
    div.classList.add('escode-switch-component')
    div.setAttribute('data-switchid', id)

    const fieldset = document.createElement('fieldset')
    const legend = document.createElement('legend')
    legend.innerHTML =  `${id}<sub>${el.tagName}</sub>`
    fieldset.appendChild(legend)
    div.appendChild(fieldset)

    // transfer display style
    const compStyles = window.getComputedStyle(el);
    div.style.display = compStyles.display

    el.parentNode.insertBefore(div, el)
    fieldset.appendChild(el)
    this.count++

    return id
}


// Select Trigger
export default function (selection, command) {

    if (this.elements[selection]) {

        const el = this.elements[selection]
        const isFocused = document.activeElement === el
        if (!isFocused) el.focus() // When the user doesn't already have an element focused, this will now show the focus ring. Though it is there...

        // Automatically click on the second selection
        if (command === 'click' || isFocused) el.click()
    }
}