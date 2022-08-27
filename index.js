import * as example from './plugins/example.js'
import * as log from './plugins/log.js'
import * as api from './plugins/api.js'

import esplugin from './src/index.js'

const start = async () => {

    // ------------------- Basic Plugin Execution -------------------
    const instance = new esplugin(example)

    // copy the plugin info
    const e2 = Object.assign({}, example)
    e2.attributes = Object.assign({}, e2.attributes)
    e2.attributes.innerHTML = 'Click Me Too'
    const secondInstance = new esplugin(e2)

    const apiInstance = new esplugin(api)

    const res = await instance.run()

    const apiRes = await apiInstance.run('add', 1,2)
    console.log('apiRes: 1 + 2 =', apiRes)


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

    await instance.run()
    await secondInstance.run()
}

start()