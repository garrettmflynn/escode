
// import * as esm from 'esmpile'

// ------------------------------ HTML Helper Functions ------------------------------
function updateKey(key) {
    let newK = key
    const match = newK.match(/[A-Z][a-z]/g);
    // name = name.split(/(?=[A-Z][a-z])/).map(str => str.toLowerCase()).join(' ') // Split on Capital Letters (but not acronyms)

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
            const updatedVal = obj[key] // (catchKeys[key] instanceof Function) ? catchKeys[key](obj[key], opts): obj[key]
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
    const attrs = getAttributes(parentObject[name], opts)
    const el = document.createElement(attrs['tag-name'] ?? 'div')
    el.id = name
    parent.appendChild(el)
    for (let key in attrs) {
        el.setAttribute(key, attrs[key])
    }
    toHTMLElement(parentObject[name], opts, el)
}

// ------------------------------ HTML Core Functions ------------------------------
export function json(json) {

    if (typeof json === 'string' || json.constructor.name === 'Buffer') json = JSON.parse(json);
    
    const listeners = {}

    const drill = (object, acc='', path=[], indentation = 0) => {


        let outerTag = 'link'
        
        for (let key in object.__listeners) {
            const transformedKey = [...path, key].join('.')
            if (!listeners[transformedKey]) listeners[transformedKey] = {}
            listeners[transformedKey] = {...listeners[transformedKey], ...object.__listeners[transformedKey]} // merge listeners
        }

        const indents = Array.from({length: indentation}, () => '\t').join('')

        for (let name in object.__children) {
            const component = object.__children[name];

            const thisPathArr = [...path, name]
            const thisPath = thisPathArr.join('.')

            const contentInfo = (component.__children) ? drill(component, undefined, thisPathArr, indentation + 1) : ''

            const content = contentInfo.content
            const tag = component.__element ?? ((contentInfo.tag && contentTag !== 'link') ? 'div' : 'link')
            if (tag !== 'link') outerTag = 'div'

            let inner = ''

            const attributes = []

            // Set True Attributes
            for (let attr in component.__attributes) {
                const key = updateKey(attr)
                const val = component.__attributes[attr]
                if (key === 'innerText') inner = val
                else if (key === 'innerHTML') inner = val
                else attributes.push(`${key}="${val}"`)
            }
            

            // Set Properties not encoded into the HTML
            const properties = Object.keys(component).filter(key => !['__element', '__children', '__attributes', '__listeners'].includes(key))
            properties.forEach(str => {
                if (str.slice(0,2) === '__') attributes.push(`${str}="${component[str]}"`)
                else attributes.push(`.${str}="${component[str]}"`)
            })

            // Set Listeners
            if (listeners[thisPath]) {
                for (let key in listeners[thisPath]) {
                    const listener = listeners[thisPath][key]
                    if (listener === true) attributes.push(`__listeners.${key}`)
                    else if (typeof listener === 'function') attributes.push(`__listeners.${key}="${listener.toString()}"`)
                    else {
                        let drill = (value, path=[]) => {
                            for (let key in value) {
                                const thisPath =  [...path, key]
                                if (typeof value[key] === 'object') drill(value[key], thisPath)
                                else attributes.push(`${['__listeners', ...thisPath].join('.')}="${value[key]}"`)
                            }
                        }
                        drill(listener)
                    }
                }
                delete listeners[thisPath]
            }

            // Finalize Attributes
            let attrText = (attributes.length) ? `${[`id="${name}"`, ...attributes].join(' ')}` : ''

            // Set Inner Content
            inner = content ? `${indents}${content}` : inner

            acc += `\n${indents}<${tag} ${attrText}>${inner ? `${inner}` : ''}</${tag}>`
        }

        return {
            content: acc,
            tag: outerTag
        }
    }

    const contentInfo = drill(json, undefined, undefined, 1)
    return `<${contentInfo.tag}>${contentInfo.content}\n</${contentInfo.tag}>`
}

export function toHTMLElement(json, opts, parent) {
    if (!parent) parent = opts.parentNode ?? document.body // set first parent with options...
    for (let key in json) {
        if (key === 'components') {
            for (let name in json[key]) handleComponents(name, json[key], parent, opts)
        }
    }

    return parent
}


export function fromHTMLElement(element, options) {

    options.parentNode = element

    const ref = {components:{}}
    const toIgnore = ['id']
    const drill = (el, ref) => {
        if (ref.components){

            for (let child of el.children) {
                // Include a reference to the relevant element
                const childRef = ref.components[child.id] = {element: child}
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