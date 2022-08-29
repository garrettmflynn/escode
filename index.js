import * as example from './plugins/example.js'
import * as log from './plugins/log.js'
import * as api from './plugins/api.js'

import esplugin from './src/index.js'

const start = async () => {

    // ------------------- Basic Plugin Execution -------------------
    const instance = new esplugin(example)
    await instance.init()

    // copy the plugin info
    console.log('example' ,example)
    const e2 = Object.assign({}, example)
    e2.attributes = Object.assign({}, e2.attributes)
    e2.attributes.innerHTML = 'Click Me Too'
    const secondInstance = new esplugin(e2)
    await secondInstance.init()

    const apiInstance = new esplugin(api)
    await apiInstance.init()

    const apiRes = await apiInstance.run('add', 1, 2) // as a graph, specify the node
    console.log('apiRes: 1 + 2 =', apiRes)

    const res = await instance.run()
    console.log('instance without graph context', res)

    // ------------------- Basic Graph Support -------------------
    const esGraph = new esplugin({
        graph: {
            nodes: {
                first: instance,
                second: secondInstance,
                log
            },
            edges: {
                first: {log: {}},
                second: {log: {}}
            }
        }
    })

    await esGraph.init()
    
    await instance.run()

    await secondInstance.run()
}

start()