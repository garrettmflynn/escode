
import { Graph } from "../../libraries/external/graphscript/index"
import * as esc from '../showcase/demos/graph/index.esc'
import tree from './tree.js'
import * as transform from './transform.js'

const divs = {};

const toGS = 'escXgs'
const toESC = 'gsXesc'

const trees = [
    {id: 'tree', value: tree},
    {id: 'esc', value: esc},
    {id: 'escXgs', value: esc},
    {id: 'gsXesc', value: tree}
];

const readouts = document.getElementById('readouts')

for (let i in trees){
    
    const o = trees[i]
    console.log(`------------------------ Loading ${o.id} ------------------------`)

    let tree = o.value

    if (!divs[o.id]) {
        divs[o.id] = document.createElement('ol')
        divs[o.id].id = o.id
         readouts.appendChild(divs[o.id])

        divs[o.id].innerHTML = `<h1>${o.id}</h1>`
    }


    const transformToESC =  o.id == toESC
    if (transformToESC) {
        tree = transform.gsToESC(tree)
        continue;
    }


    // Convert to GS
    if (o.id === 'esc' || transformToESC) {

            const onConnected = (tree) => {

                tree.esDOM.nodeB.x += 1; //should trigger nodeA listener

                tree.esDOM.nodeB.esDOM.nodeC.default(4); //should trigger nodeA listener
            
                tree.esDOM.nodeA.jump();
                        
                const popped = tree.esDOM.nodeB.esDisconnected()  

                popped.x += 1; //should no longer trigger nodeA.x listener on nodeC, but will still trigger the nodeB.x listener on nodeA
            
                tree.esDOM.nodeA.jump(); //this should not trigger the nodeA.jump listener on nodeC now

                setTimeout(()=>{ 

                    tree.esDOM.nodeE.esDisconnected()  
                    divs[o.id].innerHTML += '<li>nodeE stopped...</li>'
            
                }, 5500)

            }

            // NOTE: This is how you declare this to work with the ESCompose object inline
            transform.esc(tree, { esParent: divs[o.id] }).then(onConnected)

            // // NOTE: Works with no esParent originally—but listeners will not be placed before onconnect declarations
            // const res = transform.esc(tree)
            // res.esParent = divs[o.id]
            // onConnected(res)            

        continue;
    }
    else if (o.id === toGS) {
        tree = transform.escToGS(tree)
    }


    let graph = new Graph({
        tree,
        loaders:{

            'looper':(props,parent,graph)=>{ //badabadabadabooop

                if(props._node.loop && typeof props._node.loop === 'number') {
                    let oncreate = (node) => {
                        if(node._node.loop && typeof node._node.loop === 'number') {
                            node._node.isLooping = true
                            if(!node._node.looper) {
                                node._node.looper = () => {
                                    if(node._node.isLooping) {
                                        node._node.operator();
                                        setTimeout(node._node.looper,node._node.loop);
                                    }
                                }
                                node._node.looper();
                            }
                        }
                    }
        
                    if(typeof props._node.oncreate === 'undefined') props._node.oncreate = [oncreate];
                    else if (typeof props._node.oncreate === 'function') props._node.oncreate = [oncreate,props._node.oncreate];
                    else if (Array.isArray(props._node.oncreate)) props._node.oncreate.unshift(oncreate);
        
                    let ondelete = (node) => {
                        if(node._node.isLooping) node._node.isLooping = false;
                    }
        
                    if(typeof props._node.ondelete === 'undefined') props._node.ondelete = [ondelete];
                    else if (typeof props._node.ondelete === 'function') props._node.ondelete = [ondelete,props._node.ondelete];
                    else if (Array.isArray(props._node.ondelete)) props._node.ondelete.unshift(ondelete);
                }
                
            }
        }
    });

    graph.get('nodeB').x += 1; //should trigger nodeA listener

    graph.run('nodeB.nodeC', 4); //should trigger nodeA listener

    graph.get('nodeA').jump();

    let tree2 = {
        graph
    };

    let graph2 = new Graph({tree:tree2});

    let popped = graph.remove('nodeB');

    graph2.add(popped); //reparent nodeB to the parent graph

    popped.x += 1; //should no longer trigger nodeA.x listener on nodeC, but will still trigger the nodeB.x listener on nodeA

    graph.get('nodeA').jump(); //this should not trigger the nodeA.jump listener on nodeC now

    setTimeout(()=>{ 

        graph.remove('nodeE'); 
        divs[o.id].innerHTML += '<li>nodeE popped!</li>'

    },5500)

}
