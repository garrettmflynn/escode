import animate from './graphscript/animate'
import element from './graphscript/element'
import esc from './graphscript/esc'

import compose from './graphscript/compose'

// export {

//     start,
//     stop,
// }


import { GraphNode, Graph, GraphNodeProperties } from "../../../external/graphscript/index";

//loaders are triggered just after graphnode creation, after oncreate() is called

/**
 * setting nodeA.__node.backward:true propagates operator results to parent
 */
export const backprop = (node:GraphNode,parent:GraphNode|Graph,graph:Graph) => {
    
    if(node.__node.backward && parent instanceof GraphNode) {

        graph.setListeners({
            [parent.__node.tag]:{
                [node.__node.tag]:parent
            }
        })
    }

    
}

/** Branching operations
 * 
 * nodeA.__node.branch = {[key:string]:{if:Function|any, then:Function|any|GraphNode}}
 * 
 * nodeA.__listeners['nodeB.x'] = {
 *  callback:(result)=>void, 
 *  branch:{if:Function|any, then:Function|any|GraphNode}
 * }
 * 
 */
export const branching = (node:GraphNode,parent:GraphNode|Graph,graph:Graph) => {
    if(typeof node.__node.branch === 'object' && node.__operator && !node.__node.branchApplied) {
        let fn = node.__operator;
        node.__node.branchApplied = true;
        node.__operator = ((...args:any[]) => {
            let result = fn(...args);
            for(const key in node.__node.branch) { //run branching operations
                let triggered = () => {
                    if(typeof node.__node.branch[key].then === 'function') {
                        node.__node.branch[key].then(result); //trigger a callback
                    } else if(node.__node.branch[key].then instanceof GraphNode && node.__node.branch[key].then.__operator) {
                        node.__node.branch[key].then.__operator(result); //run a node
                    } else result = node.__node.branch[key].then; //just replace the result in this case
                }
                if(typeof node.__node.branch[key].if === 'function') {
                    if(node.__node.branch[key].if(result)) {
                        triggered();
                    }
                } else if(node.__node.branch[key].if === result) {
                    triggered();
                } 
            }
            return result;
        });
    }
    if(node.__listeners) {
        for(const key in node.__listeners) {
            if(typeof node.__listeners[key] === 'object') {
                if(node.__listeners[key].branch && !node.__listeners[key].branchApplied) {
                    let fn = node.__listeners[key].callback;
                    
                    node.__listeners[key].branchApplied = true;
                    node.__listeners.callback = (ret) => {
                        let triggered = () => {
                            if(typeof node.__listeners[key].branch.then === 'function') {
                                ret = node.__listeners[key].branch.then(ret); //trigger a callback
                            } else if(node.__listeners[key].branch.then instanceof GraphNode && node.__listeners[key].branch.then.__operator) {
                                ret = node.__listeners[key].branch.then.__operator(ret); //run a node
                            } else ret = node.__listeners[key].branch.then; //just replace the result in this case
                        }
                        if(typeof node.__listeners[key].branch.if === 'function') {
                            if(node.__listeners[key].branch.if(ret)) {
                                triggered();
                            }
                        } else if(node.__listeners[key].branch.if === ret) {
                            triggered();
                        } 
                        return fn(ret);
                    }
                }
            }
        }
    }
}

/** Trigger listeners oncreate with specific arguments
 * 
 *  nodeA.__listeners['nodeB.x'] = { callback:(result)=>void, oncreate:any }
 * 
 */
export const triggerListenerOncreate = (node:GraphNode,parent:GraphNode|Graph,graph:Graph) => {
    if(node.__listeners) {
        for(const key in node.__listeners) {
            if(typeof node.__listeners[key] === 'object') {
                if(node.__listeners[key].oncreate) {
                    node.__listeners[key].callback(node.__listeners[key].oncreate);
                }
            }
        }
    }
}

/** Trigger listeners oncreate with specific arguments
 * 
 *  nodeA.__listeners['nodeB.x'] = { callback:(result)=>void, binding:{[key:string]:any} }
 * 
 */
export const bindListener = (node:GraphNode,parent:GraphNode|Graph,graph:Graph) => {
    if(node.__listeners) {
        for(const key in node.__listeners) {
            if(typeof node.__listeners[key] === 'object') {
                if(typeof node.__listeners[key].binding === 'object') {
                    node.__listeners.callback = node.__listeners.callback.bind(node.__listeners[key].binding);
                }
            }
        }
    }
}


/**
 * 
 *  nodeA.__listeners['nodeB.x'] = { callback:(result)=>void, transform:(result)=>any }
 * 
 */
export const transformListenerResult = (node:GraphNode,parent:GraphNode|Graph,graph:Graph) => {
    if(node.__listeners) {
        for(const key in node.__listeners) {
            if(typeof node.__listeners[key] === 'object') {
                if(typeof node.__listeners[key].transform === 'function' && !node.__listeners[key].transformApplied) {
                    let fn = node.__listeners[key].callback;
                    node.__listeners[key].transformApplied = true;
                    node.__listeners.callback = (ret) => {
                        ret = node.__listeners[key].transform(ret)
                        return fn(ret);
                    }
                }
            }
        }
    }
}


export const substitute__operator = (node:GraphNode & GraphNodeProperties, parent:GraphNode|Graph,graph:Graph) => {
    //console.log('route', r)
    if(node.post && !node.__operator) {
        node.__setOperator(node.post);
    } else if (!node.__operator && typeof node.get == 'function') {
        node.__setOperator(node.get);
    } if(!node.get && node.__operator) {
        node.get = node.__operator;
    } if(node.aliases) {
        node.aliases.forEach((a) => {
            graph.set(a,node);
            let ondelete = (node) => {
                graph.__node.nodes.delete(a);
            }
    
            node.__addOndisconnected(ondelete);
        })
    }
    if(typeof graph.__node.tree[node.__node.tag] === 'object' && node.get) graph.__node.tree[node.__node.tag].get = node.get;
}

//standard loaders with flow logic for operators and listeners
export const loaders = {

    // First compose the object
    compose,

    // Then set DOM behaviors
    element,

    // Then animate any of the object behaviors
    animate,

    // Then set the start and stop behavior
    // start,
    // stop,

    backprop,
    branching,
    triggerListenerOncreate,
    bindListener,
    transformListenerResult,
    substitute__operator
}