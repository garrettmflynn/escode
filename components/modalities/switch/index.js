import * as onElementUtils from '../onElement.js'

export const observer = undefined

const style = `
    .escode-switch-component {
        background: white;
        border-radius: 10px;
        padding: 20px;
        border: 2px solid black;
        width: fit-content;
        position: relative;
        margin: 10px;
    }

    .escode-switch-component > legend {
        line-height: 0px;
        font-weight: bold;
    }
`

export const elements = {}


export function esInit() {

    onElementUtils.start.call(this, {
        stylesheet: style,
        callback: this.register,
        type: 'interactive'
    })

}

export function esDelete () {
    onElementUtils.stop.call(this)
}


export const count = 1

export function register(el) {

    // Track Element
    const id = this.count
    this.elements[id] = el

    // Label Element
    const fieldset = document.createElement('fieldset')
    fieldset.classList.add('escode-switch-component')
    fieldset.setAttribute('data-switchid', id)
    const legend = document.createElement('legend')
    legend.innerText =  id
    fieldset.appendChild(legend)

    // transfer display style
    const compStyles = window.getComputedStyle(el);
    fieldset.style.display = compStyles.display

    el.parentNode.insertBefore(fieldset, el)
    fieldset.appendChild(el)
    this.count++

    return id
}


// Select Trigger
export default function (selection, command) {

    if (this.elements[selection]) {

        const isFocused = document.activeElement === this.elements[selection]
        if (!isFocused) this.elements[selection].focus() // When the user doesn't already have an element focused, this will now show the focus ring. Though it is there...

        // Automatically click on the second selection
        if (command === 'click' || isFocused) this.elements[selection].click()
    }
}