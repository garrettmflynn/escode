export const x = 1
export const y = 2

export const jump = function(){
    const id = this.__node ? 'tree' : 'gsXesc'
    const treeDiv = document.getElementById(id)
    treeDiv.innerHTML += `<li>jump!</li>`
    return 'jumped!'; 
}

export const __listeners = {
    'nodeB.x': function(newX){ 
        console.log('Changing a.x with b.x listener', this)
        this.x = newX; 
        const id = this.__node ? 'tree' : 'gsXesc'
        const treeDiv = document.getElementById(id)
        treeDiv.innerHTML += `<li>nodeB x prop changed: ${newX}</li>`

    }, //listeners in a scope are bound to 'this' node
    'nodeB.nodeC': function(op_result){
        const id = this.__node ? 'tree' : 'gsXesc'
        const treeDiv = document.getElementById(id)
        treeDiv.innerHTML += `<li>nodeC operator returned: ${op_result}</li>`
    },
    'nodeB.nodeC.z': function(newZ){
        console.log('nodeC z prop changed... (NOT HAPPENING)')
        const id = this.__node ? 'tree' : 'gsXesc'
        const treeDiv = document.getElementById(id)
        treeDiv.innerHTML += `<li>nodeC z prop changed: ${newZ}</li>`
    }
}