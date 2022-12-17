import { Graph, GraphNode, GraphNodeProperties } from "../../../../../external/graphscript/index"
import create from '../../native/esc'

export default (node:GraphNode & GraphNodeProperties, parent:GraphNode|Graph, graph:Graph) => {

    const options = graph.__node.options 

    return create(
        node,               // Main object
        {},                 // Blank object to merge in
        options             // Options
    )
}