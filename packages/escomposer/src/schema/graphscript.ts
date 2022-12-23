import * as esc from "escompose/src/index" 

// export const esc = (esc, options = {}) => {
//     return esc.create(esc, options, {listen: true, clone: true})
// }

export const from = (gs) => {

    let globalListeners = {['']: {}}

    const drill = (target, acc: any={}, path: string[] = []) => {

        const nodeInfo = target._node
        delete target._node

        acc = Object.assign(acc, target)

        if (typeof target === 'function' && path.length) {
            acc.default = target
        } else if (nodeInfo) {
            if (nodeInfo.children) {
                acc.__children = {} // intantiate the __children object
                for (let key in nodeInfo.children) {
                    const child = nodeInfo.children[key]
                    acc.__children[key] = drill(child, {}, [...path, key])
                }
            }

            if (nodeInfo.listeners) {
                for (let key in nodeInfo.listeners) {

                    // TODO: Handle other listener cases
                    globalListeners[''][key] = {
                        value: nodeInfo.listeners[key],
                        __bind: path.join('.') // TODO: Make this responsive to other separators
                    }
                }
            }

            // Convert operator to default function
            if (nodeInfo.operator && !acc.default) acc.default = nodeInfo.operator

            // Convert loop to interval
            if(nodeInfo.loop) acc.__animate = nodeInfo.loop / 1000
        }

        return acc
    }

    if (!('_node' in gs)) gs = {
        _node: {
            children: gs
        }
    }

    const esc = drill(gs)
    esc.__listeners = globalListeners
    return esc
}

export const to = (component) => {

    let listeners = {}

    const drill = (target, acc: any = {}, prevKey = '') => {

        // Track Listeners
        if (target.__listeners) {
            Object.keys(target.__listeners).forEach(str => {
                Object.keys(target.__listeners[str]).forEach((key) => {
                    const listener = target.__listeners[str][key]
                    const targetStr  = listener.__bind.split('.').slice(-1)[0] ?? key
                    if(!listeners[targetStr]) listeners[targetStr] = {}
                    listeners[targetStr][key] = listener.value ?? listener
                })
            })
        }

        // Drill First
        if (target.__children) {
            if (!acc._node) acc._node = {}
            if (!acc._node.children) acc._node.children = {}
            drill(target.__children, acc._node.children, '__children')
        }


        // Set on Accumulator
        Object.keys(target).forEach((key) => {

            if (prevKey === '__children') {

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
                if (key === '__animate') acc._node.loop = target[key] * 1000

        })

        return acc
    }


    const result = esc.create(component, undefined, {listen: false }) // synchronous response
    const tree = drill({ __children: {component: result} })._node.children.component._node.children
    tree._node = { listeners: listeners[''] }

    return tree
}