import * as logPlugin from '../../../plugins/log.js' // simple plugin
import * as pluginPlugin from '../../../plugins/index.js' // complex plugin

import pkg from './package.json' assert {type: "json"} // complex plugin
import graph from './index.wasl' assert {type: "json"} // complex plugin

// Exports Define Exposed "Ports" on your Plugin
export const log = logPlugin
export const plugin = pluginPlugin

// Exports Define Exposed "Ports" on your Plugin
export default {
    package: pkg,
    graph
}