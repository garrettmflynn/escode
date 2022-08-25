import * as example from './plugins/example.js'
import * as log from './plugins/log.js'

import esplugin from './src/index.js'

// ------------------- Basic Plugin Execution -------------------
const examplePlugin = new esplugin(example)
await examplePlugin.init()
await examplePlugin.run().then(res => {
    console.log('Not yet in a graph', res.default)
})

// ------------------- Basic Graph Support -------------------
const esGraph = new esplugin({
    graph: {
        nodes: {
            example: examplePlugin,
            log
        },
        edges: {
            example: {log: {}}
        }
    }
})

await examplePlugin.run()