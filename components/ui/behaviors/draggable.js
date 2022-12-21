
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


export const ontouchstart = function (e) {dragStart.call(this, e)}
export const ontouchend = function (e) {dragEnd.call(this, e)}
export const ontouchmove = function (e) {drag.call(this, e)}
export const onmousedown = function (e) { dragStart.call(this, e)}
export const onmouseup = function (e) { dragEnd.call(this, e)}
export const onmousemove = function (e) { drag.call(this, e)}

function onAllWindowEvents (callback) {
    for (let key in this) {
        if (key.slice(0,2) === 'on') callback(key.slice(2), this[key])
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

    onAllWindowEvents.call(this, (key, value) => this.__element.addEventListener(key, value, false))
}


export function __ondisconnected() {
    onAllWindowEvents.call(this, (key, value) => this.__element.removeEventListener(key, value, false))

}

export function dragStart(e) {

    this.style(this.__parent.__element)

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
    unstyle(this.newParent ?? this.__parent.__element)
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

export function style(target = this.__parent.__element) {

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

export function unstyle(target = this.__parent.__element) {
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
            if (newParent && newParent !== document && newParent !== document.body && newParent !== this.__parent.__element) {
                this.unstyle(this.newParent)
                this.newParent = newParent
                this.style(this.newParent)
            }
        }
    }
}