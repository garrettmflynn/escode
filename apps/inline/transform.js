import * as escompose from "../../libraries/escompose/src/index"


export const esc = (esc, options = {}) => {
    return escompose.create(esc, options, {listen: true, clone: true})
}

export const gsToESC = (gs) => {

    const drill = (target, acc={}) => {

        const nodeInfo = target._node
        delete target._node

        acc = Object.assign(acc, target)

        if (nodeInfo) {
            if (nodeInfo._children) {
                acc.esDOM = {} // intantiate the esDOM object
                for (let key in nodeInfo._children) {
                    const child = nodeInfo._children[key]
                    acc.esDOM[key] = drill(child, {})
                }
            }
        }

        return acc
    }

    const res = drill(gs)
    console.log('ESC', res)
    return res
}

export const escToGS = (esc) => {

    let listeners = {}

    const drill = (target, acc={}, prevKey) => {

        // Track Listeners
        if (target.esListeners) {
            Object.keys(target.esListeners).forEach(str => {
                Object.keys(target.esListeners[str]).forEach((key) => {
                    const listener = target.esListeners[str][key]
                    const targetStr  = listener.esBind.split('.').slice(-1)[0] ?? key
                    if(!listeners[targetStr]) listeners[targetStr] = {}
                    listeners[targetStr][key] = listener.value ?? listener
                })
            })
        }

        // Drill First
        if (target.esDOM) {
            if (!acc._node) acc._node = {}
            if (!acc._node.children) acc._node.children = {}
            drill(target.esDOM, acc._node.children, 'esDOM')
        }


        // Set on Accumulator
        Object.keys(target).forEach((key) => {

            if (prevKey === 'esDOM') {

                    // Create Node
                    if (!acc[key]) acc[key] = target[key]
                    acc[key]._node = {} // set node

                    // Add Listeners
                    if (listeners[key]) {
                        acc[key]._node.listeners = {
                            ...acc[key]._node.listeners,
                            ...listeners[key]
                        }
                        delete listeners[key]
                    }

                    drill(target[key], acc[key], key)
                }

                if (key === 'default') {
                    acc._node.operator = target[key]
                    delete target[key]
                }
                if (key === 'esAnimate') acc._node.loop = target[key] * 1000

        })

        return acc
    }


    const component = escompose.create(esc, undefined, {listen: false, synchronous: true})
    const tree = drill({ esDOM: {component} })._node.children.component._node.children
    tree._node = { listeners: listeners[''] }

    return tree
}