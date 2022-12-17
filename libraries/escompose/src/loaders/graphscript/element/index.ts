import { Graph, GraphNode, GraphNodeProperties } from "../../../../../external/graphscript/index"
import * as element from '../../native/element'

export default (node:GraphNode & GraphNodeProperties, parent:GraphNode|Graph, graph:Graph) => {

    const id = node.__node.tag
    const options = graph.__node.options 
    parent = parent.__node?.ref ?? parent

    return element.create(
        id, // ID
        node,            // Node
        parent,          // Parent Node
        options          // Options
    )
}