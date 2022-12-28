import { specialKeys } from "../../../../spec/properties"
import { all } from "../../common/properties"
import { isNativeClass } from "../../common/utils"

export const name = 'props'

export const properties = {
    dependents: [specialKeys.properties]
}

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

    const root =  esc[specialKeys.root]
    const val = esc[specialKeys.properties]

    root.props = {
        original: [] as string[]
    }

    let propsAdded: undefined | Object = undefined

    Object.defineProperty(esc, specialKeys.properties, {
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
                    root.props.original = props
                }

                // Create a proxy props object if set multiple times
                else {
                    const ogProps = propsAdded
                    propsAdded = {}
                    proxy(propsAdded, ogProps, root.props.original)
                }

                proxy(esc, newProps, props, propsAdded)
            }
        },
        enumerable: false,
        configurable: false
    })    

    if (val) esc[specialKeys.properties] = val

    return esc
}


export default propsLoader