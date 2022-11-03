import * as nodeA from './nodes/nodeA.js'

const nodeAInstance = Object.assign({}, nodeA)

 const tree = {

    nodeA: nodeAInstance,

    nodeB:{
        x:3,
        y:4,
        _node:{
            children:{
                nodeC:{
                    z:4,
                    _node:{
                        operator:function(a) { 
                            this.z += a; 

                            const id = this._node ? 'tree' : 'gsXesc'
                            const div = document.getElementById(id)
                            div.innerHTML += `<li>nodeC z prop added to</li>`
                            return this.z; 
                        },
                        listeners:{
                            'nodeA.x':function(newX) { 
                                const id = this._node ? 'tree' : 'gsXesc'
                                const div = document.getElementById(id)
                                div.innerHTML += `<li>nodeA x prop updated ${newX}</li>`

                            },
                            'nodeA.jump':function(jump) { 
                                const id = this._node ? 'tree' : 'gsXesc'
                                const div = document.getElementById(id)
                                div.innerHTML += `<li>nodeA ${jump}</li>`
                            }
                        }
                    }
                }
            }
        }
    },


    nodeD: (a,b,c)=>{ return a+b+c; }, //becomes the ._node.operator prop and calling triggers setState for this tag (or nested tag if a child)

    nodeE:{
        _node:{
            loop:1000,
            operator:function(){
                const id = this._node ? 'tree' : 'gsXesc'
                const div = document.getElementById(id)
                div.innerHTML += `<li>looped!</li>`
            }
        }
    }

}


export default tree