export const x = 1
export const y = 2
export const jump = ()=>{
    const treeDiv = document.getElementById('tree')
    treeDiv.innerHTML += `<li>jump!</li>`
    return 'jumped!'; 
}
export const _node = {
    listeners:{
        'nodeB.x':function(newX){ 
            this.x = newX; 

            const treeDiv = document.getElementById('tree')
            treeDiv.innerHTML += `<li>nodeB x prop changed: ${newX}</li>`

        }, //listeners in a scope are bound to 'this' node
        'nodeB.nodeC':function(op_result){
            const treeDiv = document.getElementById('tree')
            treeDiv.innerHTML += `<li>nodeC operator returned: ${op_result}</li>`
        },
        'nodeB.nodeC.z':function(newZ){
            const treeDiv = document.getElementById('tree')
            treeDiv.innerHTML += `<li>nodeC z prop changed: ${newZ}</li>`
        }
    }
}