import element from '../element.js'

export const x = 1

export const y = 2

export const jump = function(){
    element.innerHTML += `<li>jump!</li>`
    return 'jumped!'; 
}

export const __operator = function(){
    console.log('TEST')
}

export const __listeners = {
    'nodeB.x': function(newX){ 
        this.x = newX; 
        element.innerHTML += `<li>nodeB x prop changed: ${newX}</li>`
    }, //listeners in a scope are bound to 'this' node
    
    'nodeB.nodeC':function(op_result){
        element.innerHTML += `<li>nodeC operator returned: ${op_result}</li>`
    },

    'nodeB.nodeC.z':function(newZ){
        element.innerHTML += `<li>nodeC z prop changed: ${newZ}</li>`
    },

    'nodeE': 'jump'
    
    // function(e) {
    //     element.innerHTML += `<li>nodeE ${e}</li>`
    // } // 'jump'
}