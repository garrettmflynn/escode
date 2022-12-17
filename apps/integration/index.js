
import { Editor } from "../../libraries/escode/src";
import { Graph } from "../../libraries/external/graphscript/index"
import { loaders } from "../../libraries/escompose/src/loaders/index";

import demos from '../showcase/demos/index'

// import tree from './tree.js'

const readout = document.getElementById('readout')

const editor = new Editor()

document.body.appendChild(editor)

const tree = Object.assign({}, demos.basic.reference)
// const tree = Object.assign({}, demos.animations.reference)

tree.__parent = readout

const orderedLoaders = []
if (loaders.compose) orderedLoaders.push(loaders.compose)
if (loaders.element) orderedLoaders.push(loaders.element)

let graph = new Graph({
    tree,
    loaders: orderedLoaders,
    options: {}
});

console.log('graph', graph)
editor.set(graph) // Set 'graph script' object
editor.setUI(readout)
