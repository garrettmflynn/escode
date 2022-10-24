
import { LitElement, html, css } from 'lit';
import { GraphNode, GraphNodeProps } from './Node';
import './Edge';
import './Node';
import drag from './utils/drag'
import { GraphEdge } from './Edge';

export type GraphWorkspaceProps = {
  // tree: {[x:string]: any}
  graph: waslGraph;
  plot?: Function[],
  onPlot?: Function
  preprocess?: Function
}

export class GraphWorkspace extends LitElement {

  static get styles() {
    return css`

    :host * {
      box-sizing: border-box;
    }

    :host {
        overflow: hidden;
        --grid-size: 5000px;
        --grid-color: rgb(210, 210, 210);
    }

    #grid {
        position: relative;
        background-image:
        repeating-linear-gradient(var(--grid-color) 0 1px, transparent 1px 100%),
        repeating-linear-gradient(90deg, var(--grid-color) 0 1px, transparent 1px 100%);
        background-size: 20px 20px;
        width: var(--grid-size);
        height: var(--grid-size);
    }

    #grid:active:hover {
      cursor: move;
    }

    visualscript-graph-node {
      cursor: move;
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
        // tree: {
        //   type: Object,
        //   reflect: false,
        // },
        updateCount: {
          type: Number,
          reflect: true,
        },
      };
    }

    graph: GraphWorkspaceProps['graph'] // NOTE: This graph should remain consistent with the visual graph (!!!)
    updateCount: number = 0
    
    context: {
      zoom: number,

      minZoom: number,
      maxZoom: number,

      start: {
        x: number,
        y: number
      },
      point: {
        x: number,
        y: number
      }
    } = {
        zoom: 1,
        minZoom: 0.6 / window.devicePixelRatio,
        maxZoom: 3.0,
        start: {x: 0, y: 0},
        point: {x: 0, y: 0}

    }
    editing: HTMLElement | null = null
    mouseDown:boolean = false

    middle:{
      x: number, 
      y: number
    } = {x: 0, y:0}

    relXParent?: number
    relYParent?: number
    element: HTMLDivElement

    nodes: Map<string, GraphNode> = new Map()
    edges: Map<string, GraphEdge> = new Map()

    firstRender: boolean = true
    toResolve: Function[] = []


    onEdgesReady = () => {}

    constructor(props?: GraphWorkspaceProps) {
      super();

      if (props) this.set(props.graph)

      // Resize with Window Resize
      window.addEventListener('resize', () => {
        this.resize()
      })
    }

    set = async (graph) => {
      this.graph = graph
      await this.triggerUpdate(true)
    }

    updated() {

      // Rerender when All Edges have been Readied
      if (this.firstRender) {
        this.onEdgesReady = () => {
          this.firstRender = false
          this.triggerUpdate()
          this.onEdgesReady = () => {}
        }
      } 
      
      // Apply Final Methods
      else {

        this.element = this.shadowRoot.querySelector("div")
        this.addEventListener('mousedown', e => { 
          this.context.start = { x: e.clientX - this.context.point.x, y: e.clientY - this.context.point.y };
          this.mouseDown = true
        } )
        window.addEventListener('mouseup', e => { this.mouseDown = false} )
        this.addEventListener('wheel', this._scale)
        this.addEventListener('mousemove', this._pan)

        const rect = this.element.getBoundingClientRect()

        this.middle = {
          x: rect.width / 2,
          y: rect.height / 2
        }

        // autolayout nodes added through the graph interface
      let notMoved = []
      this.nodes.forEach((node) => {
        if (node.info.extensions?.visualscript) {
          const info = node.info.extensions.visualscript;
          if (info.x === 0 && info.y === 0)
            notMoved.push(node);
        } else
          notMoved.push(node);
      });

      this.autolayout(notMoved)
      this._transform() // Move to center

      if (this.toResolve.length > 0) {
        this.toResolve.forEach(f => f()) // return to those waiting for a full rerender
        this.toResolve = []
      }
    }

    this.resize() // Catch first edge to resize

  }

  resize = (nodes = Array.from(this.nodes.values())) => {
    nodes.forEach(node => node.edges.forEach(e => e.resize()))
  }


  // can be awaited until full rerender
    triggerUpdate = (reset=false) => {
      return new Promise(resolve => {
        this.toResolve.push(() => resolve(true))
        if (reset) this.firstRender = true // Reset first render of this graph
        this.updateCount = this.updateCount + 1
      })
    }

    resolveEdge = async (info, willAwait=true) => {

      if (!(this.editing instanceof GraphEdge)){

        const tempId = `${Math.round( 10000 * Math.random())}`
        const edge = new GraphEdge(Object.assign({workspace: this}, info))
        this.editing = edge

        this.edges.set(tempId, edge) // Place temp into DOM to trigger edge.rendered

        const grid = this.shadowRoot.querySelector('#grid')
        if (grid) grid.appendChild(edge)
        else console.warn('[visualscript-graph-workspace]: Grid has not been rendered yet.')

        edge.ready.then(res => {
          if (res){
            this.edges.delete(tempId)
            this.edges.set(edge.id, edge)
            edge.resize()
          }
        }).catch(() => {})

        if (willAwait) await edge.ready // Wait until the edge is complete

        this.editing = null
        return edge
      } else await this.editing.link(info) // Link second port to the current edge
    }

    autolayout = (nodes: GraphNode[] | Map<string, GraphNode> = this.nodes) => {
      let count = 0
      let rowLen = 5
      let xOff = 100
      let yOff = 150

      const numNodes = nodes?.size ?? nodes?.length
      const width = Math.min(rowLen, numNodes) * xOff
      const height = (1 + Math.floor(numNodes/rowLen)) * yOff

      // Set top-left viewport location
      this.context.point.x = width
      this.context.point.y = Math.max(this.parentNode.clientHeight / 2 , height)

      // Move nodes
      nodes.forEach((n) => {
        n.x = this.middle.x  + xOff*(count % rowLen) - width / 2
        n.y =  this.middle.y  + yOff*(Math.floor(count/rowLen)) - height / 2
        count++
      })

    }

    removeNode = (name) => {
      const node = this.nodes.get(name)
      if (
        this.toResolve.length === 0 // workspace has rendered
        && this.onnoderemoved instanceof Function // callback is a function
        ) this.onnoderemoved(node)

      // update wasl
      delete this.graph.nodes[node.info.tag]

      // update ui
      this.nodes.delete(name)
    }

    addNode = (props: GraphNodeProps) => {
      if (!props.workspace) props.workspace = this
 
      // shift position to the middle
      if (props.info?.extensions?.visualscript?.x) props.x = props.info.extensions.visualscript.x
      if (props.info?.extensions?.visualscript?.y) props.y = props.info.extensions.visualscript.y

      // update ui
     const gN = new GraphNode(props)
      this.nodes.set(gN.info.tag, gN)
      if (
        this.toResolve.length === 0 // workspace has rendered
        && this.onnodeadded instanceof Function // callback is a function
        ) this.onnodeadded(gN)
      
      // add node to grid without full rerender
      const grid = this.shadowRoot.querySelector('#grid')
      if (grid) grid.appendChild(gN)

      // update wasl
      this.graph.nodes[gN.info.tag] = gN.info

      return gN
    }

    drag = (item: GraphNode | any) => {
            // add drag handler
      drag(this, item, () => {
            this.resize([item])
          }, () => { 
            if (!this.editing) this.editing = item
          }, () => {
            if (this.editing instanceof GraphNode) this.editing = null
        })
    }

    createUIFromGraph = async () => {

      let nodes:any = ''

      if (this.graph){

        for (let key in this.graph.nodes) {
          const n = this.graph.nodes[key]
            if (!n.tag) n.tag = key
            let gN = this.nodes.get(n.tag);
            if (!gN){
              gN = this.addNode({
                info: n,
                workspace: this
              })
            }
        }

        for (let key in this.graph.edges) {
          const nodeEdges = this.graph.edges[key]
          for (let targetKey in nodeEdges) {

          const output = this.match(key)
          const input = this.match(targetKey)

          const edges = {}

          // Don't duplicate on construction
          const outTag = output.port.tag
          if (!edges[outTag]) edges[outTag] = []
          if (!edges[outTag].includes(input.port.tag)){

            await this.resolveEdge({
              input: input.port,
              output: output.port
            });    

            edges[outTag].push(input.port.tag)
          }   

        }
      }
      
        this.onEdgesReady()
      }

      return nodes
    }

   match = (route:string) => {

      let tags = route.split('.')
      let portName = tags.pop()
      let match = this.nodes.get(route);

      tags.forEach(t => {
        const temp = this.nodes.get(t)
        if (temp) match = temp
      })

      if (tags.length === 0) portName = 'default'; // fallback to default port
      let port = match.ports.get(portName);
      if (!port) port = match.ports.get('_internal');  // fallback to internal port

      return {
        // route: [...tags, portName].join('.'),
        port,
        match
      }
}
    
    render(){

      // Get Nodes from Graph on First Render
      if (this.firstRender) this.createUIFromGraph()  


      // Auto Layout
        return html`
        <div id=grid>
            ${Array.from(this.nodes.values())}
            ${Array.from(this.edges.values())}
        </div>
      `
    }

    // Events
    onedgeadded?: (edge:GraphEdge) => void = () => {}
    onedgeremoved?: (edge:GraphEdge) => void = () => {}
    onnodeadded?: (node:GraphNode) => void = () => {}
    onnoderemoved?: (node:GraphNode) => void = () => {}

    // Behavior
    _scale = (e) => {
      e.preventDefault()
      let xs = (e.clientX - this.context.point.x) / this.context.zoom;
      let ys = (e.clientY - this.context.point.y) / this.context.zoom;
      let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
      this.context.zoom = (delta > 0) ? (this.context.zoom * 1.2) : (this.context.zoom / 1.2);
      if (this.context.zoom < this.context.minZoom) this.context.zoom = this.context.minZoom // clamp
      if (this.context.zoom > this.context.maxZoom) this.context.zoom = this.context.maxZoom // clamp


      this.context.point.x = e.clientX - xs * this.context.zoom;
      this.context.point.y = e.clientY - ys * this.context.zoom;

      this._transform()
  }

    _transform = () => {
      this.element.style['transform'] = `translate(calc(-50% + ${this.context.point.x}px), calc(-50% + ${this.context.point.y}px)) scale(${this.context.zoom*100}%)`
    }
    


    _pan = (e) => {

      // e.preventDefault();

      if (!this.editing){

        if (e.target.parentNode){

            // Transform relative to Parent
            let rectParent = e.target.parentNode.getBoundingClientRect();
            let curXParent = (e.clientX - rectParent.left)/rectParent.width; //x position within the element.
            let curYParent = (e.clientY - rectParent.top)/rectParent.height;  //y position within the element.
        
            if (this.mouseDown){

                this.context.point.x = (e.clientX - this.context.start.x);
                this.context.point.y = (e.clientY - this.context.start.y);
                this._transform()
            } 
            this.relXParent = curXParent
            this.relYParent = curYParent
          }
        }
    }

  }
  
  customElements.get('visualscript-graph-workspace') || customElements.define('visualscript-graph-workspace',  GraphWorkspace);