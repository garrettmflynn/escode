
import { LitElement, html, css } from 'lit';
import { GraphNode } from './Node';

export type GraphPortProps = {
  // tree: {[x:string]: any}
  // plot?: Function[],
  // onPlot?: Function
  // preprocess?: Function,
  tag?: string
  node?: GraphNode
  ref?: any
}

export class GraphPort extends LitElement {

  static get styles() {
    return css`

    :host * {
      box-sizing: border-box;
    }

    :host {
        display: block;
        pointer-events: none;
        --grid-color: rgb(210, 210, 210);
    }

    :host > div {
        width: 100%;
        display: flex; 
        align-items: center;
        justify-content: space-between;
        color: white;
        font-size:7px;
    }

    .input {
      transform: translateX(-50%);
      left: 0;
    }

    .output {
      transform: translateX(50%);
      right: 0;
    }

    .port {
      pointer-events: all;
      width: 10px;
      height: 10px;
      background: gray;
      cursor: pointer;
      border-radius: 10px;
      z-index: -1;
    }

      @media (prefers-color-scheme: dark) { 

        :host {
            --grid-color: rgb(45, 45, 45);
        }
        
      }

    `;
  }
    
    static get properties() {
      return {
        tag: {
          type: String,
          reflect: true,
        },
        keys: {
          type: Object,
          reflect: true,
        },
      };
    }

    node: GraphPortProps['node']
    tag: GraphPortProps['tag']
    element: HTMLDivElement
    output: HTMLDivElement = document.createElement('div')
    input: HTMLDivElement = document.createElement('div')

    resolving: boolean = false
    edges: Map<string, any> = new Map()
    ref: GraphPortProps['ref']

    constructor(props: GraphPortProps = {}) {
      super();

      this.node = props.node
      this.tag = props.tag
      this.ref = props.ref


      this.output.classList.add('port')
      this.output.classList.add('output')
      this.input.classList.add('port')
      this.input.classList.add('input')

    }

    // set = async (tree={}) => {
    //   this.tree = tree
    //   this.keys = Object.keys(this.tree)
    // }

    updated(changedProperties) {
      this.element = this.shadowRoot.querySelector("div")
      if (!this.node) this.node = (this.parentNode.parentNode.parentNode as any).host
    }

    setEdge = (edge) => {
      this.edges.set(edge.id, edge)
      this.node.setEdge(edge) // Nodify node
    }

    deleteEdge = (id) => {
      this.edges.delete(id)
      this.node.deleteEdge(id) // Nodify node
    }

    resolveEdge = async (ev) => { 
        if (!this.resolving){
          this.resolving = true
          const type = (ev.path[0].classList.contains('input')) ? 'input' : 'output'
          if (this.node.workspace) await this.node.workspace.resolveEdge({[type]: this}).catch(e => console.log(e))
          this.resolving = false
        }
    }

    onmousedown = this.resolveEdge

    onmouseup = (ev) => {
      const maybeEdge = this.node.workspace.editing
      if (
        'node' in maybeEdge 
        && 'box' in maybeEdge 
        && 'svgInfo' in maybeEdge
      ) this.resolveEdge(ev)
    }
    
    render() {

        return html`
        <div>
          ${this.input}
          ${this.tag}
          ${this.output}
        </div>
      `

    }
  }
  
  customElements.get('visualscript-graph-port') || customElements.define('visualscript-graph-port',  GraphPort);