export const esElement = 'ul'  // default element

export const itemType = 'li'
export const items = []
export default function (...args) {
    const inputs = args.flat(2)
    inputs.forEach(input => {
        if (typeof input === 'string'){
            const li = document.createElement(this.itemType)
            li.innerText = input
            this.esElement.appendChild(li)
            items.push(input)
        }
    })
    return [items]
}