import * as nodeA from './nodes/nodeA.js'
import * as nodeF from './nodes/nodeF.js'

import { isNode, log } from '../utils'

const nodeAInstance = Object.assign({}, nodeA)


const shared = {
    value: 0,
}

let value = 0

function defaultFunction () {
    const originalType = typeof this.__.original
    let name = this.__.name
    if (typeof name === 'symbol') name = 'root'
    const message = `instanced node (${name} ${originalType === 'function' ? 'class' : originalType}) called! ${this.shared.value} ${this.unshared.value}`
    this.shared.value++
    this.unshared.value++
    this.value++
    log.add(message)
}

class nodeClass { //treated as a class to instance rather than a function to set as default
    
    static __ = true
    
    shared = shared

    unshared = { value }

    value = 0

    default = defaultFunction
}

const nodeClassInstance = new nodeClass()

const nodeD = (...args)=>{ return args.reduce((a,b) => a + b, 0); }
// nodeD.__ = true

let tree = {

    nodeA: nodeAInstance,

    nodeB:{
        __: true, // Artificially trigger as a node
        x:3,
        y:4,
        nodeC:{
            z:4,
            default:function(a) { 
                this.z += a; 
                const message = 'nodeC operator: nodeC z prop added to'
                log.add(message)
                return this.z; 
            },
            // __listeners:{
            //     'nodeA.x':function() { 
            //         const message = 'nodeC listener: nodeA x prop updated'
            //         log.add(message)
            //     },
            //     'nodeA.jump':function() { 
            //         const message = 'nodeC listener: nodeA '
            //         log.add(message)
            //     }
            // }
        }
        
    },

    nodeD: nodeD, //becomes the .default prop and calling triggers setState for this tag (or nested tag if a child)


    nodeE:{
        __animate: 1,
        default:function (){
            const message = 'looped'
            log.add(message)
            return true;
        },
    },

    nodeG: nodeClass,

    nodeH: nodeClass,

    nodeI: nodeClassInstance,

    // Global Listeners
    // TODO: Allow for bound implementations of global listeners
    __listeners: {
        'nodeD':function(res){
            const message = 'nodeD operator returned: ' + res
            log.add(message)
        },
        'nodeB.nodeC':function(op_result){
            const message = 'nodeA listener: nodeC operator returned:'
            log.add(message)
        },
        'nodeB.nodeC.z':function(newZ){
            const message = 'nodeA listener: nodeC z prop changed:'
            log.add(message)
        },
    
        // ---------- Equivalent Decarations ----------
        // From —> To
        // 'nodeB.x':'jump',
        // 'nodeE': 'jump',
    
        // To —> From
        'nodeA.jump': {
            'nodeE': true,
            'nodeB.x': true
        },

        '': {
            'nodeA.jump': function() { 
                const message = 'nodeC listener: nodeA '
                log.add(message)
            },
        }
    }

};


if (!isNode) tree.nodeF = nodeF

export default tree