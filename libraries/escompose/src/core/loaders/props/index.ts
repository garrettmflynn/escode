import { all } from "../../../../../common/properties"
import { isNativeClass } from "../../../../../external/graphscript"

export const name = 'props'

export const required = true

export const properties = {
    dependents: ['__props']
}


let originalPropKeys: string[]

const proxy = (target, source, props?, globalProxy = source) => {

    if (!props) props = all(source)
    props.forEach(str => {
        if (!(str in target)) {

            const desc = {
                get: () => {
                    return globalProxy[str]
                },
                set: (newVal) => {
                    globalProxy[str] = newVal
                },
                enumerable: true,
                configurable: false
            }

            // Double proxy this...
            if (globalProxy !== source) Object.defineProperty(globalProxy, str, desc)

            Object.defineProperty(target, str, desc)
        }
    })
}

const propsLoader = ( esc ) => {

    const val = esc.__props

    let propsAdded: undefined | Object = undefined

    Object.defineProperty(esc, '__props', {
        get: () => {
            return propsAdded
        },
        set: (newProps) => {

            if (typeof newProps !== 'object' && !isNativeClass(newProps)) console.warn('Props must be an object')
            else {

                const props = all(newProps)
                // Just set new properties as the props object
                if (!propsAdded) {
                    propsAdded = newProps
                    originalPropKeys = props
                }

                // Create a proxy props object if set multiple times
                else {
                    const ogProps = propsAdded
                    propsAdded = {}
                    proxy(propsAdded, ogProps, originalPropKeys)
                }

                proxy(esc, newProps, props, propsAdded)
            }
        },
        enumerable: false,
        configurable: false
    })    

    if (val) esc.__props = val

    return esc
}


export default propsLoader