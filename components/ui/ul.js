export const tagName = 'ul'

export const items = []
export default function (...args) {
    console.error('Args', args)
    const inputs = args.flat()
    inputs.forEach(input => {
        if (typeof input === 'string'){
            const li = document.createElement('li')
            li.innerText = input
            this.element.appendChild(li)
            items.push(input)
        }
    })
    return [items]
}