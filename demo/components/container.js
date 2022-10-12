export const tagName = 'div'
export let componentToMove;
export const attributes = {
    innerHTML: `Click Me to Reparent Button`,
    onclick: function () {
        if (this.componentToMove) {
            if (typeof this.componentToMove === 'string') {
                const el = document.getElementById(this.componentToMove)
                if (el.component) this.componentToMove = el.component
                else return console.error('component not found')
            }
            this.componentToMove.parentNode = this.element
        }
    }
}
