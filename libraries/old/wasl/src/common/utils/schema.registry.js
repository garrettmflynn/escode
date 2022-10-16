import v000ComponentSchema from '../../../versions/0.0.0/component.schema.json' assert {type: 'json'}
import v000ModuleSchema from '../../../versions/0.0.0/module.schema.json' assert {type: 'json'}

// import v000GraphSchema from '../../../versions/0.0.0/graph.schema.json' assert {type: 'json'}
// import v000EdgesSchema from '../../../versions/0.0.0/edges.schema.json' assert {type: 'json'}
// import v000NodesSchema from '../../../versions/0.0.0/nodes.schema.json' assert {type: 'json'}
// import v000PortsSchema from '../../../versions/0.0.0/ports.schema.json' assert {type: 'json'}
// import v000PortSchema from '../../../versions/0.0.0/port.schema.json' assert {type: 'json'}


export default {
    ['0.0.0']: {
        // 'graph.schema.json': v000GraphSchema,
        // 'nodes.schema.json': v000NodesSchema,
        // 'edges.schema.json': v000EdgesSchema,
        'component.schema.json': v000ComponentSchema,
        'module.schema.json': v000ModuleSchema,
        // 'ports.schema.json': v000PortsSchema,
        // 'port.schema.json': v000PortSchema
    }
}