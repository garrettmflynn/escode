
// import * as esm from 'esmpile'

import HTMLParser from 'node-html-parser'

const attrRegex = /([_\.a-zA-Z][_\.a-zA-Z0-9\-]+)(?:=(?:(?:"([^"]*)")|(?:[^\s]*)))?/g

// ------------------------------ HTML Helper Functions ------------------------------
export function html(text, outputType='object') {

    HTMLParser.parse(text)

    if (typeof json !== 'string') text = text.toString();

    const parsed = HTMLParser.parse(text)

    // TODO: Remove __children from here...
    const main = {}
    let resultObject = {
        __children: {
            "": main
        }
    }

    const handler = (el, parent={}, path) => {

        const ignore = ['id']
        const out = [{
            key: '__listeners',
            transform: (value, key, acc, path) => {
                const to = path.join('.')
                if (!acc[to]) acc[to] = {}
                acc[to][key] = value
            }
        }]

        if (el.childNodes) {

            const info = parent[el.id] ?? {}
            parent[el.id] = info
            if (el.id) path.push(el.id)
            
            info.__element = el.rawTagName
            let attrs = {}

            const matched = el.rawAttrs.matchAll(attrRegex)

            const set = (key, value, acc, transform = (value, key, acc) => acc[key] = value, depth=false) => {
                
                const split = key.split('.')
                for (let i=0; i<split.length; i++) {
                    const key = split[i]
                    if (i === depth) {
                        transform(value || true, split.slice(i).join('.'), acc, path)
                        return
                    } else if (i === split.length - 1) transform(value || true, key, acc, path)
                    else {
                        if (!acc[key]) acc[key] = {}
                        acc = acc[key]
                    }
                }
            }

            for (const match of matched) {
                const [_, key, value] = match

                if (!ignore.includes(key)) {
                    const found = out.find(o => key.slice(0, o.key.length) === o.key)
                    if (found) set(key, value, main, found.transform, 1)
                    else if (key.slice(0, 2) === '__') set(key, value, info)
                    else if (key[0] === '.') set(key.slice(1), value, info)
                    else set(key, value, attrs)
                }
            }

            if (Object.keys(attrs).length) info.__attributes = attrs
            
            if (el.childNodes.length) handleChildNodes(el, info, path)

            return info

        } else return undefined
    }

    const handleChildNodes = (el, parent={}, path=[]) => {
        el.childNodes.forEach(o => {
            if (o.constructor.name === 'HTMLElement') {
                if (!parent.__children) parent.__children = {}
                handler(o, parent.__children, [...path])
            }
            else {
                if (!o.isWhitespace) {
                    if (!parent.__attributes) parent.__attributes = {}
                    parent.__attributes.innerText = o.rawText // Setting 
                }
            }
        })
        return parent
    }


   const object = handleChildNodes(parsed, resultObject) .__children[''] // First element is always just a container...

   if (outputType === 'text') return JSON.stringify(object, null, 2)
   else return object
}

