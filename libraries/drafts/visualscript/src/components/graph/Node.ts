
import { LitElement, html, css } from 'lit';
import { GraphWorkspace } from './Workspace';
import './Port';
import { GraphEdge } from './Edge';
import { GraphPort, GraphPortProps } from './Port';

export const isPrivate = (key) => key[0] === '_' // NOTE: Is redeclared from common/standards.js

export type GraphNodeProps = {
  workspace?: GraphWorkspace
  x?: number;
  y?: number;
  tag?: string,
  info?: any; // Add ES Component types...
}

export class GraphNode extends LitElement {

  static get styles() {
    return css`

    :host {
      font-family: var(--visualscript-font-family, sans-serif);
      position: absolute;
      box-sizing: border-box;
      top: 10px;
      left: 10px;
      user-select: none;
      z-index: 1;
    }

    :host > div {
      min-width: 50px;
      background: rgb(60,60,60);
    }

    #header {
      color: var(--visualscript-primary-font-color, white);
      font-size: 8px;
      background: var(--visualscript-primary-color, black);
      padding: 5px;
      padding-right: 25px;
      font-weight: 800;
    }


    #ports {
      min-height: 10px;
      color: var(--visualscript-secondary-font-color, white);
      background: var(--visualscript-secondary-color);
    }

    #ports > div:not(:last-child) {
      border-bottom: 1px solid var(--visualscript-secondary-font-color, gray);
    }

    #ports visualscript-graph-port{
      padding: 2px 0px;
    }

    @media (prefers-color-scheme: dark) { 
      #header {
        color: var(--visualscript-primary-font-color-dark, var(--visualscript-primary-font-color, black));
        background: var(--visualscript-primary-color-dark, var(--visualscript-primary-color, white));
      }
    }

    `;
  }
    
    static get properties() {
      return {
        x: {
          type: Number,
          reflect: true,
        },
        y: {
          type: Number,
          reflect: true,
        },
        keys: {
          type: Object,
          reflect: true,
        },
      };
    }

    workspace: GraphNodeProps['workspace'];
    element: HTMLDivElement

    tag: string;
    x: GraphNodeProps['x'];
    y: GraphNodeProps['y'];
    info: GraphNodeProps['info'];
    edges: Map<string, GraphEdge> = new Map()
    ports: Map<string, GraphPort> = new Map()
    portCategories: {
      properties: Map<string, GraphPort>,
      components: Map<string, GraphPort>,
      default: Map<string, GraphPort>,
    } = {
      properties: new Map(),
      components: new Map(),
      default: new Map(),
    }

    portOrder = ['default', 'components', 'properties']

    elements = {
      main: document.createElement('div')
    }

    
    constructor(props: GraphNodeProps = {}) {
      super();

      this.elements.main.id = 'ports'

      this.workspace = props.workspace
      this.info = props.info ?? {tag: 'node', __extensions: {visualscript: {x: 0, y:0}}}

      this.tag = props.tag
      this.id = `${this.tag}_${Math.round(10000*Math.random())}`

      if (!this.info.__extensions) this.info.__extensions = {}
      if (!this.info.__extensions.visualscript) this.info.__extensions.visualscript = {x: 0, y:0}
      this.info.__extensions.visualscript.x = this.x = props.x ?? this.info.__extensions.visualscript.x ?? 0
      this.info.__extensions.visualscript.y = this.y = props.y ?? this.info.__extensions.visualscript.y ?? 0

      if (this.info) this.updatePorts()
    }

    setInfo = (info) => {
      this.info = info
      this.updatePorts(info)
    }

    updatePorts = async (info=this.info) => {

      const notify = (tag, value) => {
        const got = this.portCategories[type].get(tag)

          if (got === value) console.warn('Redeclared port: ', `${this.tag}.${tag}`)
          else {
            console.error('Port conflict: ', `${this.tag}.${tag}`)
          }
      }
      
      const type = 'properties'
      Object.keys(info).forEach(tag => {
        if (tag.slice(0,2) === '__') return // no __ (esCode special) properties
        if (isPrivate(tag)) return // no underscore (pseudo-private) properties

        let thisType = type
        if (tag === 'default' || tag === '__operator') thisType = 'default'
        if (this.portCategories[thisType].has(tag)) {
          notify(tag, info[tag])
          return
        }
        this.addPort({ tag, type: thisType as any})
      })

      // Add Port for Each Active ES Component instance (i.e. the internal graph)
      const components = info.__?.components
      if (info.__) {
          const components = info.__.components as Map<string, any>
          const type = 'components'
          Array.from(components.entries()).forEach(([tag, component]) => {
          if (this.portCategories[type].has(tag)) {
            notify(tag, component[tag])
            return
          }
          this.addPort({ tag, type })
        })
      }

    }

    willUpdate = (updatedProps) => {

      if ((updatedProps.has('x') || updatedProps.has('y')) && this.info.__extensions?.visualscript){
        this.info.__extensions.visualscript.x = this.x        // brainsatplay extension
        this.info.__extensions.visualscript.y = this.y       // brainsatplay extension
      }

      if (updatedProps.has('info')) this.updatePorts()
    }

    updated() {
      if (!this.workspace) this.workspace = (this.parentNode.parentNode as any).host

      // add drag handler
      this.workspace.drag(this)

      this.edges.forEach(e => e.resize()) // resize all edges after
    }

    setEdge = (edge) => this.edges.set(edge.id, edge)

    deleteEdge = (id) => {
      this.edges.delete(id)
    }

    addPort = (info: GraphPortProps) => {
      const port = new GraphPort(Object.assign({node: this}, info))
      this.ports.set(port.tag, port)

      // Set in type-specific registry
      const category = this.portCategories[info.type] ?? this.portCategories.default
      category.set(port.tag, port)

      let ports = this.elements[info.type]

      if (!ports) {
        this.elements[info.type] = ports = document.createElement('div')
        ports.id = `${info.type}Ports`

        const idx = this.portOrder.findIndex(str => str === info.type)
        const beforeChild = this.elements.main.children[idx]
        if (beforeChild) this.elements.main.insertBefore(ports, beforeChild);
        else this.elements.main.appendChild(ports)
      }
      
      ports.appendChild(port) // Adding port to rendered html

      return port
    }

    deinit = (triggerInWorkspace= true) => {
      if (triggerInWorkspace) this.workspace.removeNode(this)
      this.edges.forEach(e => e.deinit()) // Remove edges
      this.remove()
    }
    
    render() {

        return html`

        <style>

        :host {
          transform: scale(${1}) translate(${this.x}px, ${this.y}px);
        }


        </style>
        <div>
          <div id="header">
            ${this.tag}
          </div>
          ${this.elements.main}
        </div>
      `

    }
  }
  
  customElements.get('visualscript-graph-node') || customElements.define('visualscript-graph-node',  GraphNode);