import { keySeparator } from "../../../../../esc/standards";
import { GraphNode } from "../../../../../external/graphscript";
import nativeCompose from '../../native/compose'


// This is a basic animation function that allows users to specify (1) the number of animations per second (e.g. 60), or (2) other values to use the global requestAnimationFrame loop (e.g. true, 'global')
export default function compose( node: GraphNode ) {
    const path = node.__node.tag.split(keySeparator)
    const options = node.__node.options

    return nativeCompose(
        node, 
        {}, 
        path, // Path 
        options,
        true // Update original
    )
}