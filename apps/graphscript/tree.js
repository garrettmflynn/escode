import * as nodeA from './nodes/nodeA.js'

import element from './element.js'

const nodeAInstance = Object.assign({}, nodeA)

 const tree = {

    nodeA: nodeAInstance,

    nodeB:{
        x:3,
        y:4,

        __ondisconnected: () => {
            element.innerHTML += '<li><b>nodeB removed!</b></li>'
        },
        __children:{

            nodeC:{
                z:4,
                __operator:function(a) { 
                    this.z += a; 

                    element.innerHTML += `<li>nodeC z prop added to</li>`
                    return this.z; 
                },

                __listeners:{

                    'nodeA.x': function(newX) { 
                        element.innerHTML += `<li>nodeA x prop updated ${newX}</li>`
                    },

                    'nodeA.jump': function(jump) { 
                        element.innerHTML += `<li>nodeA ${jump}</li>`
                    },
                }
            }

        }
    },


    nodeD: (a,b,c)=>{ return a+b+c; }, //becomes the ._node.operator prop and calling triggers setState for this tag (or nested tag if a child)

    nodeE:{
        __loop:1000,
        __ondisconnected: () => {
            element.innerHTML += '<li><b>nodeE removed!</b></li>'
        },
        __operator: function(){
            element.innerHTML += `<li>looped!</li>`
            return 'looped!'
        }
    }

}


export default tree