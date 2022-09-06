export let nExecutions = 0

export const tagName = 'button'
export const attributes = {
    innerHTML: `Click Me`,
    onclick: function() {
        this.run()
    }
}

export function set(text=this.nExecutions) {
    this.element.innerText = `${this.attributes.innerHTML} (${text})`
}

export function onrender() {
    set.call(this)
}

export default function(_, increment = 1){ // actually uses this.increment
    this.nExecutions += increment
    set.call(this)
    return this.nExecutions
}