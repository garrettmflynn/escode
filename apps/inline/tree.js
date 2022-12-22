import * as nodeA from './nodes/nodeA.js'

const nodeAInstance = Object.assign({}, nodeA)

 const tree = {

    nodeA: nodeAInstance,

    nodeB:{
        x:3,
        y:4,
        nodeC:{
            z:4,
            __operator:function(a) { 

                console.log('NODE C Z THING', this)
                this.z += a; 

                const id = this.__node ? 'tree' : 'gsXesc'
                const div = document.getElementById(id)
                div.innerHTML += `<li>nodeC z prop added to</li>`
                return this.z; 
            },
            __listeners:{
                'nodeA.x':function(newX) { 
                    console.log('Node A x changed')
                    const id = this.__node ? 'tree' : 'gsXesc'
                    const div = document.getElementById(id)
                    div.innerHTML += `<li>nodeA x prop updated ${newX}</li>`

                },
                'nodeA.jump':function(jump) { 
                    const id = this.__node ? 'tree' : 'gsXesc'
                    const div = document.getElementById(id)
                    div.innerHTML += `<li>nodeA ${jump}</li>`
                }
            }
        }
    },


    nodeD: (a,b,c)=>{ return a+b+c; }, //becomes the .__node.operator prop and calling triggers setState for this tag (or nested tag if a child)

    nodeE:{
        __loop:1000,
        __operator:function(){
            const id = this.__node ? 'tree' : 'gsXesc'
            const div = document.getElementById(id)
            div.innerHTML += `<li>looped!</li>`
        }
    }

}


export default tree