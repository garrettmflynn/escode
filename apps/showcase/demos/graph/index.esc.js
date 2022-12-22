import * as nodeAComponent from './components/nodeA.esc.js'
import * as nodeBComponent from './components/nodeB.esc.js'
import * as nodeCComponent from './components/nodeC.esc.js'
import * as nodeDComponent from './components/nodeD.esc.js'

import * as utils from './utils/index.js'

const escId = 'esc'
const escxgsId = 'escXgs'

export const __element = 'div'


export const nodeA = {
    __compose: nodeAComponent,
}
export const nodeB = {
    __compose: nodeBComponent,
    nodeC: {
        __compose: nodeCComponent,
        default: function(a) { 
            this.z += a; 
            const id = this._node ? escxgsId : escId
            const esmDiv = document.getElementById(id) ?? utils.getTopNode(this)
            if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>nodeC z prop added to</li>`)

            return this.z; 
        }
    }
}

export const nodeD = {
    __compose: nodeDComponent,
}

export const nodeE = {
    __animate: 1,
    default:function () {

        const id = this._node ? escxgsId : escId
        const esmDiv = document.getElementById(id) ?? utils.getTopNode(this)
        if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>looped!</li>`)
    }
}

export const __listeners = {
    '': {

        // Attached to nodeC
        'nodeA.x': {
            value: function(newX) { 
                const id = this._node ? escxgsId : escId
                const esmDiv = document.getElementById(id) ?? utils.getTopNode(this)
                if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>nodeA x prop updated ${newX}</li>`)
            },

            __bind: 'nodeB.nodeC'
        },
        
        'nodeA.jump': {
            value: function(jump) { 
                const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? utils.getTopNode(this)
                if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>nodeA ${jump}</li>`)
            },

            __bind: 'nodeB.nodeC'
        },

        // Attached to nodeA
        'nodeB.x':{
            value: function(newX){ 
                this.x = newX; 
        
                const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? utils.getTopNode(this)
                if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>nodeB x prop changed: ${newX}</li>`)
    
                return newX
        
            },

            __bind: 'nodeA'
        },

        'nodeB.nodeC': {
            value: function(op_result){       
                const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? utils.getTopNode(this)
                if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>nodeC operator returned: ${op_result}</li>`)

                return op_result
            },

            __bind: 'nodeA'

        },

        'nodeB.nodeC.z': {
            value: function(newZ){
                const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? utils.getTopNode(this)
                if (esmDiv) esmDiv.insertAdjacentHTML('beforeend', `<li>nodeC z prop changed: ${newZ}</li>`)
                return newZ
            },

            __bind: 'nodeA'
        }
    },
}