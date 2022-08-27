export let nExecutions = 0

export const tagName = 'button'
export const attributes = {
    innerHTML: 'Click Me',
    onclick: function() {
        this.run()
    }
}

export default function(){
    this.nExecutions++
    return this.nExecutions
}