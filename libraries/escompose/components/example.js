export let nExecutions = 0

export const tagName = 'button'
export const attributes = {
    innerHTML: `Click Me`,
    onclick: function() {
        this.run()
    }
}

export function set(text=this.nExecutions) {
    this.esElement.innerText = `${this.attributes.innerHTML} (${text})`
}

export function onrender() {
    console.log('Runin', this)
    set.call(this)
}

export default function(_, increment = 1){ // actually uses this.increment
    this.nExecutions += increment

    console.log('Runin', this)
    set.call(this)
    return this.nExecutions
}