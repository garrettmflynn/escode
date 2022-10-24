
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
export const esAttributes = {
    style: {
        zIndex: 10000000,
        pointerEvents: 'none',
        position: 'absolute'
    }
}

export function esInit () {

    // Replace default element with an image of cursor
    if (this.esElement instanceof HTMLDivElement){
        const el = document.createElement('img')
        el.src = 'https://media.geeksforgeeks.org/wp-content/uploads/20200319212118/cursor2.png'
        el.width = this.size.width
        el.height = this.size.height
        this.esElement = el
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

    this.esElement.style.left = this.x + 'px'
    this.esElement.style.top = this.y + 'px'
}

export function esDelete () {
    if (this.esElement != null) this.esElement.remove()

    document.body.style.cursor = 'default'

    window.removeEventListener("click", this.click)
    window.removeEventListener("mousemove", this.onMove);
    this.stylesheets.forEach(document.head.removeChild)

    this.stylesheets = []
}

// ------------------- Commands ------------------- 

export function move (dx, dy){

    if (dx && typeof dx !== 'number') dx = this.speed
    if (dy && typeof dy !== 'number') dy = this.speed

    let desiredX = this.x + dx
    let desiredY = this.y + dy

    // Bound within Window
    if (desiredX < (window.innerWidth - this.size.width) && desiredX > 0) this.x = desiredX
    if (desiredX < (window.innerHeight - this.size.height) && desiredX > 0) this.y = desiredY

    // Trigger Cursor Events
    this.esElement.style.left = `${this.x}px`
    this.esElement.style.top = `${this.y}px`

    this.onHover(true)
}

export function click() {       

    // gets the object under the image cursor position
    var tmp = document.elementFromPoint(this.x + this.offsetX, this.y + this.offsetY); 
    if (tmp){
        this.mutex = true;
        let event = new MouseEvent('click');
        tmp.dispatchEvent(event);

        this.esElement.style.left = (this.offsetX + this.x) + "px";
        this.esElement.style.top = (this.offsetY + this.y) + "px";
    }
}

// ------------------- Event Listeners ------------------- 

export function onMove (e) {
    // Gets the x,y position of the mouse cursor

    this.x = e.clientX;
    this.y = e.clientY;
    
    // sets the image cursor to new relative position
    this.esElement.style.left = (this.offsetX + this.x) + "px";
    this.esElement.style.top = (this.offsetY + this.y) + "px";

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
            //Trigger Mouse Over on Current
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