type visualscriptExtension = {
    x: number,
    y: number
}


type nodeSrcInfo = {
    operator: Function,
}


// Types representing the basic information visualized from wasl / brainsatplay
type waslNode = {
    tag: string,
    // children?: Node[]
    // arguments?: Map<string, any>
    // graph?: waslGraph // Use if nested graphs
    // nodes?: Map<string, waslNode>
    src?: nodeSrcInfo | waslGraph, // NOTE: Can be nested
    extensions?: {
        [x:string]: {
            [x:string]: any
        },
        visualscript?: visualscriptExtension
    }
}

type waslEdge = {

}


type waslEdges = {
    // Source (output)
    [x:string]: { 

        // Target (input)
        [x:string]: waslEdge
    }
}

type waslGraph = {
    nodes: {[x:string]: waslNode}
    edges: {[x:string]: waslEdges}
}