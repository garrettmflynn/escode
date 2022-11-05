
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
      color: white;
      font-size: 8px;
      background: black;
      padding: 5px;
      padding-right: 25px;
      font-weight: 800;
    }

    #ports visualscript-graph-port{
      padding: 2px 0px;
    }

    @media (prefers-color-scheme: dark) { 

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

    constructor(props: GraphNodeProps = {}) {
      super();

      this.workspace = props.workspace
      this.info = props.info ?? {tag: 'node', esExtensions: {visualscript: {x: 0, y:0}}}

      this.tag = props.tag
      this.id = `${this.tag}_${Math.round(10000*Math.random())}`

      if (!this.info.esExtensions) this.info.esExtensions = {}
      if (!this.info.esExtensions.visualscript) this.info.esExtensions.visualscript = {x: 0, y:0}
      this.info.esExtensions.visualscript.x = this.x = props.x ?? this.info.esExtensions.visualscript.x ?? 0
      this.info.esExtensions.visualscript.y = this.y = props.y ?? this.info.esExtensions.visualscript.y ?? 0

      if (this.info) this.updatePorts()
    }

    setInfo = (info) => {
      this.info = info
      this.updatePorts(info)
    }

    updatePorts = (info=this.info) => {

      Object.keys(info).forEach(tag => {
        if (tag.slice(0,2) === 'es') return // no esX properties
        if (isPrivate(tag)) return // no underscore (pseudo-private) properties

        if (this.ports.has(tag)) return
        this.addPort({ tag })
      })

      // Add Port for Each Active ES Component instance (i.e. the internal graph)
      if (info.esDOM) Object.keys(info.esDOM).forEach(tag => {
        if (this.ports.has(tag)) {
          console.error('Port conflict: ', `${this.tag}.${tag}`)
          return
        }
        this.addPort({ tag })
      })

    }

    willUpdate = (updatedProps) => {

      if ((updatedProps.has('x') || updatedProps.has('y')) && this.info.esExtensions?.visualscript){
        this.info.esExtensions.visualscript.x = this.x        // brainsatplay extension
        this.info.esExtensions.visualscript.y = this.y       // brainsatplay extension
      }

      if (updatedProps.has('info')) this.updatePorts()
    }

    updated() {
      this.element = this.shadowRoot.querySelector("div")
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
      const ports = this.shadowRoot && this.shadowRoot.getElementById('ports')
      if (ports) ports.appendChild(port) // Adding port to rendered html
      return port
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
          <div id="ports">
              ${Array.from(this.ports.values())}
          </div>
        </div>
      `

    }
  }
  
  customElements.get('visualscript-graph-node') || customElements.define('visualscript-graph-node',  GraphNode);