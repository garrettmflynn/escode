import * as nodeA from './components/nodeA.esc.js'
import * as nodeB from './components/nodeB.esc.js'
import * as nodeC from './components/nodeC.esc.js'
import * as nodeD from './components/nodeD.esc.js'


const escId = 'esc'
const escxgsId = 'escXgs'

export const esDOM = {
    nodeA,
    nodeB: {
        esCompose: nodeB,
        esDOM: {
            nodeC: {
                esCompose: nodeC,
                default: function(a) { 
                    this.z += a; 
                    const id = this._node ? escxgsId : escId
                    const esmDiv = document.getElementById(id)
                    if (esmDiv) esmDiv.innerHTML += `<li>nodeC z prop added to</li>`

                    return this.z; 
                }
            }
        }
    },

    nodeD,

    nodeE: {
        esAnimate: 1,
        default:function () {

            const id = this._node ? escxgsId : escId
            const esmDiv = document.getElementById(id)
            if (esmDiv) esmDiv.innerHTML += `<li>looped!</li>`
        }
    }
}

export const esListeners = {
    '': {

        // Attached to nodeC
        'nodeA.x': {
            value: function(newX) { 
                const id = this._node ? escxgsId : escId
                const esmDiv = document.getElementById(id)
                if (esmDiv) esmDiv.innerHTML += `<li>nodeA x prop updated ${newX}</li>`
            },

            esBind: 'nodeB.nodeC'
        },
        
        'nodeA.jump': {
            value: function(jump) { 
                const esmDiv = document.getElementById(this._node ? escxgsId : escId)
                if (esmDiv) esmDiv.innerHTML += `<li>nodeA ${jump}</li>`
            },

            esBind: 'nodeB.nodeC'
        },

        // Attached to nodeA
        'nodeB.x':{
            value: function(newX){ 
                this.x = newX; 
        
                const esmDiv = document.getElementById(this._node ? escxgsId : escId)
                if (esmDiv) esmDiv.innerHTML += `<li>nodeB x prop changed: ${newX}</li>`
    
                return newX
        
            },

            esBind: 'nodeA'
        },

        'nodeB.nodeC': {
            value: function(op_result){       
                const esmDiv = document.getElementById(this._node ? escxgsId : escId)
                if (esmDiv) esmDiv.innerHTML += `<li>nodeC operator returned: ${op_result}</li>`

                return op_result
            },

            esBind: 'nodeA'

        },

        'nodeB.nodeC.z': {
            value: function(newZ){
                const esmDiv = document.getElementById(this._node ? escxgsId : escId)
                if (esmDiv) esmDiv.innerHTML += `<li>nodeC z prop changed: ${newZ}</li>`
                return newZ
            },

            esBind: 'nodeA'
        }
    },
}