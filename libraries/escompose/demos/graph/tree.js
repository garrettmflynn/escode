import * as nodeA from './nodes/nodeA.js'
import { log } from '../utils'

const nodeAInstance = Object.assign({}, nodeA)

class nodeClass { //treated as a class to instance rather than a function to set as default
    
    static __ = true

    default = () => {
        const message = 'class instanced node called!'
        log.add(message)
    }
}


const nodeD = (a,b,c)=>{ return a+b+c; }
nodeD.__ = true

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

    nodeF:{
        __props: document.createElement('div'), //properties on the '__props' object will be proxied and mutatable as 'this' on the node. E.g. for representing HTML elements
        __onconnected:function (node) { 
            this.innerHTML = 'Test';
            this.style.backgroundColor = 'green'; 
            document.body.appendChild(this.__props); 
        },
        __ondisconnected:function(node) {
            document.body.removeChild(this.__props);
        }
        
    },

    nodeG: nodeClass,



    // Global Listeners
    // TODO: Allow for bound implementations of global listeners
    __listeners: {
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

export default tree