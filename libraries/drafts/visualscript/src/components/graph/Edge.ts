import { LitElement, html, css } from 'lit';
import { GraphPort } from './Port';
import { GraphWorkspace } from './Workspace';

export type IOTypes = 'input' | 'output'
export type IOType = {
  output?: any
  input?: any
}

export type GraphEdgeProps = {
  workspace?: GraphWorkspace
} & IOType

export class GraphEdge extends LitElement {

  static get styles() {
    return css`

    :host {
        --grid-color: rgb(210, 210, 210);
    }
    
    :host{
        display: block;
        height: 100%;
        width: 100%;
        position: absolute;
        background: transparent;
        pointer-events: none;
        box-sizing: border-box;
        /* z-index: 1; */
    }
    
    :host(.editing) svg {
      pointer-events: none;
    }
      
    :host svg {
        pointer-events: none;
        display: block;
        height: 100%;
        width: 100%;
        position: relative;
        background: transparent;
        touch-action: none;
        /* z-index: 1; */
    }
    
      :host path {
        pointer-events: all;
        stroke-width: 0.4px;
        stroke: rgb(60, 60, 60);
        stroke-linecap: round;
        fill: none;
        transition: stroke 0.5s;
        transition: stroke-width 0.5s;
        cursor: pointer;
      }

      :host path:hover {
        opacity: 0.5;
      }
    
      :host path.updated {
        /* stroke: rgb(255, 105, 97); */
        stroke-width: 3;
        stroke: rgb(129, 218, 250);
    }
      
      :host .control {
        stroke-width: 3;
        stroke: transparent;
        fill: transparent;
        /* fill: #c00;
        cursor: move; */
      }
      
      /* :host .control:hover, #mysvg .control.drag
      {
        fill: #c00;
        cursor: move;
      }
       */
      :host line
      {
        /* stroke-width: 2;
        stroke: #999;
        stroke-linecap: round;
        stroke-dasharray: 5,5; */
        stroke: transparent;
        fill: transparent;
      }  

      @media (prefers-color-scheme: dark) { 

        :host {
            --grid-color: rgb(45, 45, 45);
        }

        :host path {
          stroke: white;
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
      keys: {
        type: Object,
        reflect: true,
      },
    };
  }

  info: waslEdge = {}
  output: GraphEdgeProps['output']
  input: GraphEdgeProps['input']

  element: SVGGraphicsElement

  node: {
    p1: SVGCircleElement
    p2: SVGCircleElement
    c1: SVGCircleElement
    c2: SVGCircleElement
    c3: SVGCircleElement
    l1: SVGLineElement
    l2: SVGLineElement
    curve: SVGPathElement
  }

  box: {
    xMin: number
    yMin: number
    xMax: number
    yMax: number
  }

  svgInfo = {
    size: 500,
    radius: 5
  }

  drag?: {
    node: HTMLElement,
    start: {
      x: number,
      y: number
    }
    cursor: DOMPoint
  };

  workspace: GraphWorkspace

  toResolve: {
    type: IOTypes,
    callback: Function,
    listeners: any[]
  }

  firstUp?: boolean
  ready: Promise<boolean>
  isReady: boolean = false;

  resolveReady?: {
    resolve: Function,
    reject: Function
  }


  constructor(props: GraphEdgeProps = {}) {
    super();

    this.output = props.output
    this.input = props.input
    this.workspace = props.workspace

    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = {
        resolve: (arg) => {
          this.id = this.getEdgeName()

          // update ui
          this.output.setEdge(this)
          this.input.setEdge(this)

          // update user
          if (
            this.workspace.toResolve.length === 0 // workspace has rendered
            && this.workspace.onedgeadded instanceof Function // callback is a function
            ) this.workspace.onedgeadded(this)

          // update wasl
          const outputTag = this.getTag()
          const inputTag = this.getTag(outputTag)

          if (!this.workspace.graph.edges[outputTag]) this.workspace.graph.edges[outputTag] = {}
          this.workspace.graph.edges[outputTag][inputTag] = this.info

          this.isReady = true
          resolve(arg)
        }, reject
      }
    })
  }

  getTag = (outName?:string) => {
    const type = (outName) ? 'input' : 'output'
    if (!this[type]) return 

    const firstPort  = this[type].node.ports.keys().next().value
    const nodeTag = this[type].node.info.tag

    const base = this[type].tag
    const route =  `${nodeTag}.${base}`

    let tag = route

    // use route if already in use (otherwise target node and fallback to first port)
    if (firstPort === base) {
      const target = (type === 'input' && outName) ? this.workspace.graph.edges[outName] : this.workspace.graph.edges
      if (target?.[nodeTag]) tag = nodeTag
      else tag = route
    }

    return tag
  }

  link = async (info: IOType) => {

    if (this.toResolve) {
      const port = info[this.toResolve.type]
      if (port) {
        const res = await this.resolveIO(port, this.toResolve.type, this.toResolve.callback)
        if (res) {
          this.toResolve.callback(true)
          this.toResolve.listeners.forEach(l => this.workspace.element.removeEventListener(l.name, l.function))
          this.toResolve = null
        } else return false
      }
      else false
    } else return false
  }

  getOtherType = (type: IOTypes) => {
    return (type === 'input') ? 'output' : 'input'
  }

  updated = async () => {

    this.element = this.shadowRoot.querySelector('svg')
    if (!this.workspace) this.workspace = (this.parentNode.parentNode as any).host

    // Set Information
    const vb = this.element.getAttribute('viewBox').split(' ').map(v => +v)
    this.box = {
      xMin: vb[0], xMax: vb[0] + vb[2] - 1,
      yMin: vb[1], yMax: vb[1] + vb[3] - 1
    }

    const node = {
      p1: null,
      p2: null,
      c1: null,
      c2: null,
      c3: null,
      l1: null,
      l2: null,
      curve: null
    }

    'p1,p2,c1,c2,c3,l1,l2,curve'.split(',').map(s => {
      node[s] = this.element.getElementsByClassName(s)[0];
    });

    this.node = node

    const res = await this.init().catch(e =>this.resolveReady.reject(e))
    if (res) this.resolveReady.resolve(true)
  }

  render() {

    // const content = this.keys?.map(key => this.getElement(key, this.tree)) 

    // return until(Promise.all(content).then((data) => {


    return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.svgInfo.size} ${this.svgInfo.size}">
          <circle cx="0" cy="0" r="${this.svgInfo.radius}" class="p1 control" />
          <circle cx="0" cy="0" r="${this.svgInfo.radius}" class="p2 control" />

          <circle cx="0" cy="0" r="${this.svgInfo.radius}" class="c1 control" />
          <circle cx="0" cy="0" r="${this.svgInfo.radius}" class="c2 control" />
          <circle cx="0" cy="0" r="${this.svgInfo.radius}" class="c3 control" />

          <line x1="0" y1="0" x2="0" y2="0" class="l1"/>
          <line x1="0" y1="0" x2="0" y2="0" class="l2"/>

          <path d="M0,0 Q0,0 0,0" class="curve" @click=${this.deinit}/>
    </svg>`
    // }), html`<span>Loading...</span>`)

  }

  getEdgeName = ({ input, output }: IOType = {
    input: this.input,
    output: this.output
  }) => {
    return `${output.node.id}-${output.tag}_${input.node.id}-${input.tag}`
  }

  resolveIO = async (el: HTMLElement, typeNeeded: IOTypes, callback: Function, origin?) => {

    let hasType = this.getOtherType(typeNeeded)

    if (el instanceof GraphPort) {
    // if (el.constructor && 'output' in el && 'input' in el) {
      const expectedID = this[hasType].edges.has(this.getEdgeName({ [hasType]: this[hasType], [typeNeeded]: el }))      
      if (expectedID) {
        callback('Edge already exists...')
        return false
      } 
      else if ( 
        el === this[hasType] // Is the element
        || this[hasType].shadowRoot.contains(el) // Is within the element
        ) {
        if (this.firstUp === false) callback('Cannot connect to self...')
        return false
      } 
      else {

        // const parentClassList = el.parentNode.parentNode.classList as DOMTokenList

        // if (Array.from(parentClassList).find(str => str.includes(typeNeeded))){
        this.workspace.editing = null
        this[typeNeeded] = el
        callback(true)
        return true


            // } else {
            //   callback('Cannot connect two ports of the same type.')
            //   return false
            // }
      }
    } else {
      if (!this.firstUp && origin === 'up') {
        this.firstUp = false
        callback('Edge not completed...')
        return false
      }
    }
  }



  // Behavior
  mouseAsTarget = (type, upCallback) => {


    let label = (type === 'output') ? 'p1' : 'p2'
    let otherType = this.getOtherType(type)

    // Allow tracking mouse movement
    let onMouseMove = (e) => {
      this.resize()

      if (this[otherType]?.shadowRoot){
        let dims = this[otherType].shadowRoot.querySelector(`.${type}`).getBoundingClientRect()
        let svgO = this.svgPoint(this.element, dims.left + dims.width / 2, dims.top + dims.height / 2)
        let svgP = this.svgPoint(this.element, e.clientX, e.clientY)

        if (isNaN(svgP.x)) svgP.x = svgO.x
        if (isNaN(svgP.y)) svgP.y = svgO.y
        this.updateElement(
          this.node[label],
          {
            cx: svgP.x,
            cy: svgP.y
          }
        );

        let points = ((type === 'output') ? [svgP, svgO] : [svgO, svgP]) as [DOMPoint, DOMPoint]

        this.updateControlPoints(...points)
        this.drawCurve();
      }
    }

    this.workspace.element.addEventListener('mousemove', onMouseMove)
    this.workspace.element.dispatchEvent(new Event('mousemove'));


    this.toResolve = {
      type,
      listeners: [
        {name: 'mousemove', function: onMouseMove},
      ],
      callback: upCallback
    }

    // Allow cancelling an edge
    let onMouseUp = (e) => {
      if (this.firstUp == undefined) this.firstUp = true
      else this.firstUp = false
      this.resolveIO(e.target, type, this.toResolve.callback, 'up')
    }

    this.workspace.element.addEventListener('mouseup', onMouseUp)
  }

  init = async () => {
    return new Promise(async (resolve, reject) => {

      let res = await this.insert() // insert into UI     
      let match, compatible, outputType, targetType;

      if (res === true) {

        // Check Edge Compatibility
        let coerceType = (t) => {
          if (t === 'float') return 'number'
          else if (t === 'int') return 'number'
          else return t
        }

        outputType = coerceType(this.output.output.getAttribute('data-visualscript-type'))
        targetType = coerceType(this.input.input.getAttribute('data-visualscript-type'))

        let checkCompatibility = (output, input) => {
          return output == input || (output === undefined || input === undefined) || (input instanceof Object && output instanceof Object)
        }

        compatible = checkCompatibility(outputType, targetType)
      }

      if (res === true && match == null && compatible) resolve(true)
      else {
        this.deinit()
        // if (match == null) reject(`edge from ${this.output?.node?.name} (${this.output?.name}) to ${this.input?.node?.name} (${this.input?.name}) already exists`) // not currently checking
        // else 
        reject(res)

      }
    })
  }


  insert = () => {
    return new Promise(async (resolve) => {

      const workspace = this.workspace ?? this.output?.node?.workspace ?? this.input?.node?.workspace

      const types = ['input', 'output']


      types.forEach(t => {
        if (this[t] == null) {
          workspace.editing = this
          this.mouseAsTarget(t, (res) => {
              workspace.editing = null
              resolve(res)
          })
        }
      })

      this.drawCurve();

      types.forEach(t => {
        // if (this[t].node) this[t].node.resizeAllEdges(this)
      })

      if (this.output && this.input) resolve(true)
    })

  }

  _activate = async () => {

    console.log('_activate function not added again...')
    // let sP = this.output
    // let tP = this.input

    // Activate Functionality
    // this.parent.app.state.data[this.uuid] = this.value

    // this.subscription = this.parent.app.state.subscribeTrigger(this.uuid, this.onchange)

    // Register Edge in Ports
    // this.output.node.edges.set(this.uuid, this)
    // this.input.node.edges.set(this.uuid, this)
    // sP.addEdge('output', this)
    // tP.addEdge('input', this)

    // Activate Dynamic Analyses
    // if (tP.analysis && (tP.edges.input.size > 0 || tP.type === null) && (tP.edges.output.size > 0 || tP.type === null)) this.parent.app.analysis.dynamic.push(...tP.analysis)
    // if (sP.analysis && (sP.edges.input.size > 0 || sP.type === null) && (sP.edges.output.size > 0 || sP.type === null)) this.parent.app.analysis.dynamic.push(...sP.analysis)

    // Update Brainstorm ASAP
    // let brainstormTarget = this.target.node.className === 'Brainstorm'
    // if (brainstormTarget) {
    //     this.parent.app.streams.push(this.output.port.label) // Keep track of streams
    //     await this.update() // Pass to Brainstorm
    // }

    // Setup Onstart Callbacks (send to Brainstorm OR Elements, Functions, or Objects)
    // let isElement = sP.value instanceof Element || sP.value instanceof HTMLDocument
    // let isFunction = sP.value instanceof Function
    // let isObject = sP.value instanceof Object
    // let isGLSL = sP.output?.type === 'GLSL'
    // let isHTML = sP.output?.type === 'HTML'
    // let isCSS = sP.output?.type === 'CSS'

    // if (brainstormTarget || isElement || isFunction  || isObject || isGLSL || isHTML || isCSS) {
    //   this.onstart.push(this.update) // Pass on applicadtion start
    // }

    // if (this.parent.app.props.ready) await this.update() // Indiscriminately activate edge with initial value (when drawing edge)

    this.addReactivity()
  }

  // drag handler
  dragHandler = (event) => {

    event.preventDefault();

    const target = event.target
    const type = event.type
    const svgP = this.svgPoint(this.element, event.clientX, event.clientY);

    // start drag
    if (!this.drag && type === 'pointerdown' && target.classList.contains('control')) {

      this.drag = {
        node: target,
        start: this.getControlPoint(target),
        cursor: svgP
      };

      this.drag.node.classList.add('drag');

    }

    // move element
    if (this.drag && type === 'pointermove') {

      this.updateElement(
        this.drag.node,
        {
          cx: Math.max(this.box.xMin, Math.min(this.drag.start.x + svgP.x - this.drag.cursor.x, this.box.xMax)),
          cy: Math.max(this.box.yMin, Math.min(this.drag.start.y + svgP.y - this.drag.cursor.y, this.box.yMax))
        }
      );

      this.drawCurve();

    }

    // stop drag
    if (this.drag && type === 'pointerup') {

      this.drag.node.classList.remove('drag');
      this.drag = null;

    }

  }


  // translate page to SVG co-ordinate
  svgPoint = (svg, x, y) => {

    var pt = new DOMPoint(x, y);
    pt.x = x;
    pt.y = y;

    return pt.matrixTransform(svg.getScreenCTM().inverse());

  }


  // update element
  updateElement = (element, attr) => {

    for (let a in attr) {
      let v = attr[a];
      element.setAttribute(a, isNaN(v) ? v : Math.round(v));
    }

  }


  // get control point location
  getControlPoint = (circle) => {

    return {
      x: Math.round(+circle.getAttribute('cx')),
      y: Math.round(+circle.getAttribute('cy'))
    }

  }

  updateControlPoints = (p1, p2) => {

    let curveMag = 0.5 * Math.abs((p2.y - p1.y))
    this.updateElement(
      this.node['c1'],
      {
        cx: p1.x + curveMag,
        cy: p1.y
      }
    );

    this.updateElement(
      this.node['c2'],
      {
        cx: p2.x - curveMag,
        cy: p2.y
      }
    );

    this.updateElement(
      this.node['c3'],
      {
        cx: (p1.x + p2.x) / 2,
        cy: (p1.y + p2.y) / 2,
      })
  }


  // update curve
  drawCurve = () => {

    const
      p1 = this.getControlPoint(this.node.p1),
      p2 = this.getControlPoint(this.node.p2),
      c1 = this.getControlPoint(this.node.c1),
      c2 = this.getControlPoint(this.node.c2),
      c3 = this.getControlPoint(this.node.c3)

    // curve
    const d = `M${p1.x},${p1.y} Q${c1.x},${c1.y} ${c3.x},${c3.y} T${p2.x},${p2.y}` +
      (this.node.curve.classList.contains('fill') ? ' Z' : '');
    this.updateElement(this.node.curve, { d });

  }


  addReactivity = () => {
    this.node['curve'].addEventListener('mouseover', () => { this._onMouseOverEdge() })
    this.node['curve'].addEventListener('mouseout', () => { this._onMouseOutEdge() })
    this.node['curve'].addEventListener('click', () => { this._onClickEdge() })
  }

  _onMouseOverEdge = () => {
    this.node['curve'].style.opacity = `0.3`
  }

  _onMouseOutEdge = () => {
    this.node['curve'].style.opacity = `1`
  }
  _onClickEdge = () => {
    this.deinit()
  }

  deinit = () => {

    // update user
    if (
      this.workspace.toResolve.length === 0 // workspace has rendered
      && this.ready // edge is ready
      && this.workspace.onedgeremoved instanceof Function // callback is a function
      ) this.workspace.onedgeremoved(this)

    // update ui
    if (this.output) this.output.deleteEdge(this.id)
    if (this.input) this.input.deleteEdge(this.id)
    // this.output.node.info.unsubscribe(this.input.node.info.id)
    this.remove()

    // update wasl
    const outputTag = this.getTag()
    const inputTag = this.getTag(outputTag)
    if (this.ready) {
      if (this.workspace.graph.edges[outputTag]) delete this.workspace.graph.edges[outputTag][inputTag]
    } else console.error('incorrect tag', outputTag, this.workspace.graph.edges)
  }

  resize = () => {

    // Grab Elements
    let arr = [
      { type: 'output', node: 'p1' },
      { type: 'input', node: 'p2' },
    ]

    let svgPorts = arr.map(o => {

      let port = this[o.type]
      if (port) {
        let portDim = port.shadowRoot.querySelector(`.${o.type}`).getBoundingClientRect()
        let svgPort = this.svgPoint(this.element, portDim.left + portDim.width / 2, portDim.top + portDim.height / 2)

        // Update Edge Anchor
        this.updateElement(
          this.node[o.node],
          {
            cx: svgPort.x,
            cy: svgPort.y
          }
        );
        return svgPort
      }
    })

    svgPorts = svgPorts.filter(s => s != undefined)
    if (svgPorts.length > 1) this.updateControlPoints(...svgPorts as [DOMPoint, DOMPoint])

    this.drawCurve();

  }
}


customElements.get('visualscript-graph-edge') || customElements.define('visualscript-graph-edge',  GraphEdge);