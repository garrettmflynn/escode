import * as example from './plugins/example.js'
import * as log from './plugins/log.js'

import esplugin from './src/old/index.js'

const start = async () => {

    // ------------------- Basic Plugin Execution -------------------
    const instance = new esplugin(example)
    const secondInstance = new esplugin(example)

    await instance.init()
    await secondInstance.init()

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