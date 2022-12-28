export const __element = 'ul'  // default element

export const itemType = 'li'
export const items = []
export default function (...args) {
    
    // Clear items
    if (args[0] === null && args.length === 1) {
        this.items = []
        this.__element.innerHTML = ''
    } 
    
    // Add Items
    else {
        const inputs = args.flat(2)
        inputs.forEach(input => {
            if (typeof input === 'string'){
                const li = document.createElement(this.itemType)
                li.innerText = input
                this.__element.appendChild(li)
                this.items.push(input)
            }
        })
    }

    return this.items
}