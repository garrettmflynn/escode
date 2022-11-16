
// Description
// Creates a virtual mouse that the user can control arbitrarily.

import { transformCSS } from './cssTransform.js'

// Position Information
export const x = 0
export const y = 0
export const offsetX = 0
export const offsetY = 0

export const speed = 10

export const mutex = false

// Cursor Information
export const cursor = undefined
export const size = {
    width: 15,
    height: 20
}

export const prevHovered = null

export const stylesheets = []

// Styling Information
export const __attributes = {
    style: {
        zIndex: 10000000,
        pointerEvents: 'none',
        position: 'absolute'
    }
}

export function __onconnected () {

    // Replace default element with an image of cursor
    if (this.__element instanceof HTMLDivElement && this.__element.innerHTML === ''){
        const el = document.createElement('img')
        el.src = 'https://media.geeksforgeeks.org/wp-content/uploads/20200319212118/cursor2.png'
        el.width = this.size.width
        el.height = this.size.height
        this.__element = el
    }

    this.stylesheets.push(transformCSS())
    let globalStyle = document.createElement('style');
    globalStyle.innerHTML = `
    * {
        cursor: none
    }
    `;
    
    document.head.appendChild(globalStyle);
    this.stylesheets.push(globalStyle)

    window.addEventListener("click", this.click)
    window.addEventListener("mousemove", this.onMove);

    this.__element.style.left = this.x + 'px'
    this.__element.style.top = this.y + 'px'
}

export function __ondisconnected () {
    if (this.__element != null) this.__element.remove()

    document.body.style.cursor = 'default'

    window.removeEventListener("click", this.click)
    window.removeEventListener("mousemove", this.onMove);
    this.stylesheets.forEach(el => el.remove())

    this.stylesheets = []
}

// ------------------- Commands ------------------- 

export function move (o){

    if (o.x && typeof o.x !== 'number') o.x = this.speed
    if (o.y && typeof o.y !== 'number') o.y = this.speed

    let desiredX = this.x + o.x
    let desiredY = this.y + o.y

    // Bound within Window
    if (desiredX < (window.innerWidth - this.size.width) && desiredX > 0) this.x = desiredX
    if (desiredY < (window.innerHeight - this.size.height) && desiredY > 0) this.y = desiredY

    // Trigger Cursor Events
    this.__element.style.left = `${this.x}px`
    this.__element.style.top = `${this.y}px`

    this.onHover(true)
}

export function click(ev, ...args) {    

    if ((ev instanceof PointerEvent)) return // Ignore mouse events

    // gets the object under the image cursor position
    var tmp = document.elementFromPoint(this.x + this.offsetX, this.y + this.offsetY); 

    if (tmp){
        this.mutex = true;
        let event = new MouseEvent('click');
        tmp.dispatchEvent(event);

        this.__element.style.left = (this.offsetX + this.x) + "px";
        this.__element.style.top = (this.offsetY + this.y) + "px";
    }
}

// ------------------- Event Listeners ------------------- 

export function onMove (e) {
    // Gets the x,y position of the mouse cursor

    this.x = e.clientX;
    this.y = e.clientY;
    
    // sets the image cursor to new relative position
    this.__element.style.left = (this.offsetX + this.x) + "px";
    this.__element.style.top = (this.offsetY + this.y) + "px";

    this.onHover(false)
}

export function onHover (trigger=true) {
    try{
    let currentHovered = document.elementFromPoint(this.x + this.offsetX, this.y + this.offsetY); 

    if (this.prevHovered != currentHovered){

        // Trigger Mouse Out on Previous
        if (this.prevHovered != null){

            let prevHovered = this.prevHovered
            let event = new MouseEvent('mouseout', {
                'view': window,
                'bubbles': true,
                'cancelable': true
                });
                prevHovered.dispatchEvent(event);
                
            while (prevHovered) {
                prevHovered.classList.remove('hover')
                prevHovered = prevHovered.parentNode;
                if (prevHovered == null || prevHovered.tagName == 'BODY' || prevHovered.tagName == null) prevHovered = null
            }
        }

        this.prevHovered = currentHovered

        if (trigger){

            //Trigger Mouse Over on Current (does not work to trigger css...)
            let event = new MouseEvent('mouseover', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });

            currentHovered.dispatchEvent(event);

            while (currentHovered) {
                currentHovered.classList.add('hover')
                currentHovered = currentHovered.parentNode;
                if (currentHovered.tagName == 'BODY' || currentHovered.tagName == null) currentHovered = null
            }
        }
    }
} catch{}
}

export default () => {

}