import * as example from './components/example.js'
import * as log from './components/log.js'
import * as api from './components/api.js'
// import * as readout from './components/readout.js'

import Component from './src/index.js'

const start = document.getElementById('start')
const stop = document.getElementById('stop')
const run = document.getElementById('run')
const runInGraph = document.getElementById('runInGraph')

const container = document.getElementById('container')

const startExecution = async () => {

    const options = { parentNode: container }
    // ------------------- Basic Component Execution -------------------
    const instance = new Component(example, options)
    await instance.start()

    // copy the component info
    console.log('example', example)
    const e2 = Object.assign({}, example)
    e2.attributes = Object.assign({}, e2.attributes)
    e2.attributes.innerHTML = 'Increment'
    e2.nExecutions = -1
    const secondInstance = new Component(e2, options)
    await secondInstance.start()

    const apiInstance = new Component(api, options)
    await apiInstance.start()

    const apiRes = await apiInstance.run('add', 1, 2) // as a graph, specify the node
    console.log('apiRes: 1 + 2 =', apiRes)

    const res = await instance.run()
    console.log('instance without graph context', res)

    let set = async () => {
        instance.graph.set.call(instance.graph.node)
        secondInstance.graph.set.call(secondInstance.graph.node)
    }

    let initialize = async () => {
        await secondInstance.run() // must run first to seed increment
    }

    // ------------------- Basic Graph Support -------------------
    const esGraph = new Component({
        components: {
            first: instance,
            second: secondInstance,
            log,
            test: {
                tagName: "div",
                style: {
                    width: '100px',
                    height: '100px',
                    background: 'red'
                },
                components: {
                    inner: {
                        tagName: "button",
                        attributes: {
                            innerText: "Reset",
                            onclick: function () {
                                this.run()
                            }
                        },
                        reset: (v) => {
                            setTimeout(set, 10)
                            return v
                        },
                        default: () => {
                            return 0
                        },

                        children: {
                            "reset": true,
                        }
                    },
                }
            },
        },

        listeners: {
            "first.nExecutions": {
                'log': true,
            },
            "second.nExecutions": {
                'first.increment': true,
            },
            'second': {
                'first.increment': true,
                'log': true
            },
            'first': {
                'log': true
            },
            'test.inner.reset': {
                'first.nExecutions': true,
                'second.nExecutions': true
            },
        }
    }, options)

    console.log('graph', esGraph)



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

    await initialize()
    await instance.run()

}

startExecution()