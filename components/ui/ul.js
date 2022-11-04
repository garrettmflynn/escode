export const esElement = 'ul'  // default element

export const itemType = 'li'
export const items = []
export default function (...args) {
    
    // Clear items
    if (args[0] === null && args.length === 1) {
        this.items = []
        this.esElement.innerHTML = ''
    } 
    
    // Add Items
    else {
        const inputs = args.flat(2)
        inputs.forEach(input => {
            if (typeof input === 'string'){
                const li = document.createElement(this.itemType)
                li.innerText = input
                this.esElement.appendChild(li)
                this.items.push(input)
            }
        })
    }

    return this.items
}