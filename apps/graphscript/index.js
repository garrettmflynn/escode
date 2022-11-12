
import { Editor } from "../../libraries/escode/src";
import { Graph } from "../../libraries/external/graphscript/index"
import tree from './tree.js'

const readout = document.getElementById('readout')



const editor = new Editor()

document.body.appendChild(editor)

let graph = new Graph({
    tree,
    loaders: {

        'looper': (props, parent, graph) => { //badabadabadabooop

            if (props.__loop && typeof props.__loop === 'number') {
                let oncreate = (node) => {
                    if (node.__loop && typeof node.__loop === 'number') {
                        node.__isLooping = true
                        if (!node.__looper) {
                            node.__looper = () => {
                                if (node.__isLooping) {
                                    node.__operator();
                                    setTimeout(node.__looper, node.__loop);
                                }
                            }
                            node.__looper();
                        }
                    }
                }


                if (typeof props.__onconnected === 'undefined') props.__onconnected = [oncreate];
                else if (typeof props.__onconnected === 'function') props.__onconnected = [oncreate, props.__onconnected];
                else if (Array.isArray(props.__onconnected)) props.__onconnected.unshift(oncreate);

                let ondelete = (node) => {
                    if (node.__isLooping) node.__isLooping = false;
                }

                if (typeof props.__ondisconnected === 'undefined') props.__ondisconnected = [ondelete];
                else if (typeof props.__ondisconnected === 'function') props.__ondisconnected = [ondelete, props.__ondisconnected];
                else if (Array.isArray(props.__ondisconnected)) props.__ondisconnected.unshift(ondelete);
            }

        }
    }
});

console.log('graph', graph)
editor.set(graph) // Set 'graph script' object
editor.setUI(readout)

graph.get('nodeB').x += 1; //should trigger nodeA listener

graph.run('nodeB.nodeC', 4); //should trigger nodeA listener

graph.get('nodeA').jump();

// let tree2 = {
//     graph
// };

// let graph2 = new Graph({ tree: tree2 });

// let popped = graph.remove('nodeB');

// graph2.add(popped); //reparent nodeB to the parent graph

// popped.x += 1; //should no longer trigger nodeA.x listener on nodeC, but will still trigger the nodeB.x listener on nodeA

graph.get('nodeA').jump(); //this should not trigger the nodeA.jump listener on nodeC now

setTimeout(() => {
    graph.remove('nodeE');
}, 5500)
