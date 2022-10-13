
import * as esm from 'esmpile'

// ------------------------------ HTML Helper Functions ------------------------------
function updateKey(key) {
    let newK = key
    const match = newK.match(/[A-Z]/g);
    if (match) match.forEach(str => newK = newK.replace(str, `-${str.toLowerCase()}`))
    return newK
}

function getAttributes(obj, opts, path=[]) {
    const acc = {}
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            const res = getAttributes(obj[key], opts, [...path, key])
            for (let k in res) {
                acc[updateKey(k)] = res[k]
            }
        }
        else {
            const updatedKey = updateKey(key)
            const updatedVal = (catchKeys[key] instanceof Function) ? catchKeys[key](obj[key], opts): obj[key]
            acc[(path.length) ? `${path.join('.')}.${updatedKey}` : updatedKey] = updatedVal
        }
    }
    return acc
}


let catchKeys = {
    src: (val, opts) => {
        let isRemote = false
        try {
            new URL(val)
            isRemote = true
        } catch {}

        const url = (isRemote) ? val : esm.resolve(val, opts.path ?? '')

        return url
    }
}

function handleComponents(name, parentObject, parent, opts) {
    const attrs = getAttributes(parentObject[name], opts) as any
    const el = document.createElement(attrs['tag-name'] ?? 'div')
    el.id = name
    parent.appendChild(el)
    for (let key in attrs) {
        el.setAttribute(key, attrs[key])
    }
    to(parentObject[name], opts, el)
    
}

// ------------------------------ HTML Core Functions ------------------------------
export function to(esc, opts, parent) {
    if (!parent) parent = opts.parentNode ?? document.body // set first parent with options...
    for (let key in esc) {
        if (key === 'components') {
            for (let name in esc[key]) handleComponents(name, esc[key], parent, opts)
        }
    }

    return parent
}


export function from(element, options) {

    options.parentNode = element

    const ref = {components:{}}
    const toIgnore = ['id']
    const drill = (el, ref) => {
        if (ref.components){

            for (let child of el.children) {
                // Include a reference to the relevant element
                const childRef = ref.components[child.id] = {element: child} as any
                if (child.children.length > 0) childRef.components = {}
                
                // Iterate through attributes
                for(let attribute of child.attributes) {
                    if (!toIgnore.includes(attribute.name)) {
                        const split = attribute.name.split('.')
                        let target = childRef
                        split.forEach((substr,i) => {

                            // capitalize first letter after dash
                            substr = substr.split('-').map((str, i) => {
                                if (i > 0) return str[0].toUpperCase() + str.slice(1)
                                else return str
                            }).join('')
                            
                            // set or keep drilling
                            if (i === split.length - 1) {
                                const val = attribute.value

                                // TODO: Convert between strings and more variables... 
                                if (val !== '') {
                                    if (!isNaN(val)) target[substr] = Number(val) // get numbers
                                    else target[substr] = val // get strings

                                } 
                                
                                // Default to True
                                else target[substr] = true
                            }
                            else {
                                if (!target[substr]) target[substr] = {}
                                target = target[substr]
                            }
                        })
                    }
                }
                drill(child, childRef)
            }
        }
    }

    drill(element, ref)

    return ref
}