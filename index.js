import * as example from './plugins/example.js'
import * as log from './plugins/log.js'
import * as api from './plugins/api.js'

import esplugin from './src/index.js'

const start = document.getElementById('start')
const stop = document.getElementById('stop')
const run = document.getElementById('run')
const runInGraph = document.getElementById('runInGraph')

const container = document.getElementById('container')

const startExecution = async () => {

    const options = {parentNode: container}
    // ------------------- Basic Plugin Execution -------------------
    const instance = new esplugin(example, options)
    await instance.start()

    // copy the plugin info
    console.log('example' ,example)
    const e2 = Object.assign({}, example)
    e2.attributes = Object.assign({}, e2.attributes)
    e2.attributes.innerHTML = 'Click Me Too'
    const secondInstance = new esplugin(e2, options)
    await secondInstance.start()

    const apiInstance = new esplugin(api, options)
    await apiInstance.start()

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

    await esGraph.start()
    
    start.onclick = () => {
        esGraph.start()
    }

    run.onclick = async () => {
        await instance.run()
        await secondInstance.run()
    }

    runInGraph.onclick = async () => {
        await esGraph.run('first')
        await esGraph.run('second')
    }

    stop.onclick = () => {
        esGraph.stop()
    }

    run.click()
}

startExecution()