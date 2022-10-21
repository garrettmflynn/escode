
export const itemTag = 'li'
export const items = []
export default function (...args) {
    const inputs = args.flat(2)
    inputs.forEach(input => {
        if (typeof input === 'string'){
            const li = document.createElement(this.itemTag)
            li.innerText = input
            this.esElement.appendChild(li)
            items.push(input)
        }
    })
    return [items]
}