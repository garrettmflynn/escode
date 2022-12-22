import { log } from '../../utils'

export const __ = true

export const x = 5
export const y = 2

export const jump = () => {
    const message = `jump!`
    log.add(message)
    return 'jumped!'; 
}

// //listeners in a scope are bound to 'this' node
// export const __listeners = {
//     'nodeB.nodeC':function(op_result){
//         const message = 'nodeA listener: nodeC operator returned:'
//         log.add(message)
//     },
//     'nodeB.nodeC.z':function(newZ){
//         const message = 'nodeA listener: nodeC z prop changed:'
//         log.add(message)
//     },

//     // ---------- Equivalent Decarations ----------
//     // From —> To
//     // 'nodeB.x':'jump',
//     // 'nodeE': 'jump',

//     // To —> From
//     'jump': {
//         'nodeE': true,
//         'nodeB.x': true
//     }
// }