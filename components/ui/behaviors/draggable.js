
export let active = false;
// export let x;
// export let y;
export let initialX;
export let initialY;
export let offsetX = 0
export let offsetY = 0;
export let parentInfo = {}
export let originalParent = {}
export let newParent = undefined

export const reparent = false

export const __attributes = {
    style: {
        cursor: 'move'
    }
}

export function __onconnected() {

    var style = this.__element.currentStyle || window.getComputedStyle(this.__element);
    const left = parseInt(style.marginLeft, 10);
    const right = parseInt(style.marginRight, 10);
    const top = parseInt(style.marginTop, 10);
    const bottom = parseInt(style.marginBottom, 10);
    const marginX = left + right
    const marginY = top + bottom
    this.offsetX = -marginX / 2;
    this.offsetY = -marginY / 2;

    this.__element.addEventListener("touchstart", (e) => dragStart.call(this, e), false);
    window.addEventListener("touchend", (e) => dragEnd.call(this, e), false);
    window.addEventListener("touchmove", (e) => drag.call(this, e), false);

    this.__element.addEventListener("mousedown", (e) => dragStart.call(this, e), false);
    window.addEventListener("mouseup", (e) => dragEnd.call(this, e), false);
    window.addEventListener("mousemove", (e) => drag.call(this, e), false);
}


export function dragStart(e) {

    this.style(this.__parent)

    const base = (e.type === "touchstart") ? e.touches[0] : e
    this.initialX = (base.clientX - this.offsetX)
    this.initialY = (base.clientY - this.offsetY)

    // Account For Nested Control Objects
    this.active = this.__element.contains(e.target)

    drag.call(this, e)
}

export function dragEnd() {
    this.initialX = this.offsetX;
    this.initialY = this.offsetY;
    this.active = false;
    unstyle(this.newParent ?? this.__parent)
    if (this.newParent) {

        const finalScreenPosition = this.__element.getBoundingClientRect()
        this.__parent = this.newParent

        const updatedScreenPosition = this.__element.getBoundingClientRect()
        this.offsetX += updatedScreenPosition.x - finalScreenPosition.x
        this.offsetY += updatedScreenPosition.y - finalScreenPosition.y

        this.newParent = undefined
    }
}



const parentStyleComponents = [
    'border',
    'borderStyle',
    'boxSizing', '-moz-box-sizing', '-webkit-box-sizing',
]

export function style(target = this.__parent) {

    this.originalParent = target
    this.parentInfo = this.originalParent.getBoundingClientRect()

    // Freeze size
    this.originalParent.style.width = `${this.parentInfo.width}px`
    this.originalParent.style.height = `${this.parentInfo.height}px`

    this.__element.style.position = 'absolute'

    target.style.border = '3px solid red'
    target.style.borderStyle = 'inset'
    target.style.boxSizing = 'border-box'
    target.style['-moz-box-sizing'] = 'border-box'
    target.style['-webkit-box-sizing'] = 'border-box'
}

export function unstyle(target = this.__parent) {
    parentStyleComponents.forEach(str => target.style[str] = '')
}

export function setPosition(x = this.offsetX, y = this.offsetY) {
    const str = `scale(${1}) translate(${x}px, ${y}px)`
    this.__element.style.transform = str
}

export function drag(e) {

    if (this.active) {

        e.preventDefault();

        const base = (e.type === "touchstart") ? e.touches[0] : e
        this.offsetX = (base.clientX - this.initialX)
        this.offsetY = (base.clientY - this.initialY)
        this.setPosition()

        // Re-Parenting
        if (this.reparent) {
            const path = document.elementsFromPoint(e.clientX, e.clientY)
            const newParent = (path[0] === this.__element) ? path[1] : path[0]
            if (newParent && newParent !== document && newParent !== document.body && newParent !== this.__parent) {
                this.unstyle(this.newParent)
                this.newParent = newParent
                this.style(this.newParent)
            }
        }
    }
}