export const __element = 'select' // default element


export const options = {
    // one: 'Option #1',
    // two: 'Option #2',
    // three: 'Option #3',
};

export const itemTag = 'option'

export const __connected = function() {
    let target = this
    let element = target.__element
    if (!element) {
        if (target.source){
            target = target.source
            element = target.__element
        } 
    }


    // Handle Objects
    let options = target.options
    if (!Array.isArray(options)) {
        options = []
        for (let key in target.options)  options.push({value: key, label: target.options[key]})
    }


    // Hide Selector without Options
    if (options.length === 0) {
        // element.style.display = 'none'
        return;
    }

    // Set Options
    const show = options.reduce((a,b) => a * !!b.show, true) // all show/hide...
    if (element) element.innerHTML = options.map((o) => {
        const value = (typeof o === 'object') ? o.value : o
        const label = o?.label ?? value
        return `<${this.itemTag} value='${value}'>${label}</${this.itemTag}>`
    })

    // Hide Dependent Elements
    element.onchange = (ev) => {
        if (show) this.showHide(ev.target.value, options, element)
        this.default(ev.target.value)
    }

    const first = options?.[0]?.value
    setTimeout(() => {
        if (show) this.showHide(first, options, element) // initialize show / hide
        this.default(first)
    }, show ? 100 : 10) // wait longer to override other select compoents
}

export function showHide(value, options, element) {
    options.forEach((o) => {
        const el = element.parentNode.querySelector(`#${o.show}`)
        if (value === o.value) {
            el.style.display = ''
            if (el.hasAttribute('escomponent')) el.__component.default(el.value) // run new value when shown
        }  else el.style.display = 'none'
    })
}

export default (input) => input