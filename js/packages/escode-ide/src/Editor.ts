
import { LitElement, html, css } from 'lit';

// Internal Dependencies
import { Plugin } from './Plugin';

// Visualscript Dependencies
import { Tab, Panel, Tree, CodeEditor, ObjectEditor, GraphEditor, Modal, global, TabBar } from "../../drafts/visualscript/src/index"
import { GraphEdge } from '../../drafts/visualscript/src/components/graph/Edge';

// ESCode and ESMonitor Dependencies
import * as esc from '../../../index'

// Default ES Component Pool for Plugins
import * as components from '../../../../js/components/index.js'
import { isListenerPort } from '../../drafts/visualscript/src/components/graph/utils/check';
import { Console } from './Console';

import { ESComponent, __source } from '../../../esc.spec';
import { specialKeys } from '../../../../spec/properties';


type ViewType = null | undefined | boolean | HTMLElement
type ViewsType = {
  ui?: ViewType,
  menubar?: ViewType,
  properties?: ViewType,
  files?: ViewType,
  graph?: ViewType,
}

export type EditorProps = {
  plugins?: any[]
  ui?: HTMLElement
  style?: Editor['style'],
  bind?: string,
  views?: ViewsType
}

export class Editor extends LitElement {

  static get styles() {
    return css`

    :host { 
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

    :host > div > * {
      flex-grow: 1;
    }

    :host > div {
      display: flex;
      width: 100%;
      height: 100%;
    }

    visualscript-tab-bar {
      max-height: 7px;
      transition: max-height 1s;
    }

    visualscript-tab-bar:hover {
      max-height: 100px;
    }

    #files {
      display: flex;
      height: 100%;
    }

    #ui {
      overflow: scroll;
    }

    #files > visualscript-tree {
      width: 250px;
    }

    #palette {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 25px;
      height: 25px;
      z-index: 2;
      cursor: pointer;
    }

    `;
  }
    
    static get properties() {
      return {
        fileUpdate: {
          type: Number,
          reflect: true
        }
      };
    }

    config: {
      esc?: any,
      dependencies?: any,
      graph: any,
      gs: any,
      original: any
    } = {
      esc: undefined,
      dependencies: undefined,
      graph: undefined,
      gs: undefined,
      original: undefined
    }

    modal = new Modal()
    ui = new Tab() 
    uiContainer = document.createElement('div')
    console = new Console()

    files = new Panel()
    filesTab = new Tab({name: 'Files'})
    propertiesTab = new Tab({name: "Properties"})

    info = new Panel()
    history: {[x:string]: any} = {}
    fileUpdate: number = 0
    graph = new GraphEditor()
    properties = new ObjectEditor()
    menubar = new TabBar()
    tree = new Tree({
      target: {},
      mode: 'files'
    })

    filesystem = {}
    views: ViewsType = {
      ui: true,
      menubar: true,
      properties: true,
      files: true,
      graph: true
    }

    onCreateFile?: Function
    bind?: string

    constructor(props:EditorProps={}) {
      super();

      
      if (props.style) {
          for (let key in props.style) {
            const value = props.style[key]
            this.style.setProperty(key, value)
        }
      }

      if (props.views) {
        this.views = Object.assign(this.views, props.views)
        for (let key in this.views) {
          const value = this.views[key]
          if (value instanceof HTMLElement) this[key] = value
        }
      }

      const contextOptions : any[]= []


      this.ui.appendChild(this.uiContainer)
      this.ui.setAttribute('name', 'UI')
      this.ui.id = 'ui'

      if (props.ui) this.setUI(props.ui)
      if (props.bind) this.bind = props.bind

      // Setup UI Style
      this.uiContainer.style.overflow = 'scroll'
      this.ui.style.display = 'grid'
      this.ui.style.gridTemplateRows = '1fr auto'
      this.ui.style.position = 'sticky'
      this.ui.style.bottom = '0px'

      // Setup Files Tab
      const div = document.createElement('div')
      div.id = 'files'
      div.appendChild(this.tree)
      if (this.files) div.appendChild(this.files)
      this.filesTab.appendChild(div)

      // Setup Properties Tab
      if (this.properties) {
        this.propertiesTab.appendChild(this.properties)
        contextOptions.push({
          text: 'View Properties',
          onclick: (_, node) => {
            const relPath = node.info.__path.replace(`${this.config.esc.__path}.`, '')
            const res = this.properties.to(relPath)
            if (res) this.propertiesTab.toggle.select()
          }
        })
      }

      // Setting Context Menu Responses
      this.graph.contextMenu.set(`visualscript-graph-editor_nodes_${Math.random()}`, {
        condition: (path) => {
            let returned: any = false
            this.graph.workspace.nodes.forEach(n => {
              if (path.includes(n)) returned = n
            })
            return returned
          },
        contents: () => {
          return contextOptions
          
        }
      })

      // -------------------- Setup ESCode x visualscript interface --------------------

      const getTags = (edge) => {
        const fullOutTag = `${edge.output.node.tag}.${edge.output.tag}`
        const fullInTag = `${edge.input.node.tag}.${edge.input.tag}`
        const tags =  (
          // (this.graph.workspace.edgeMode  === 'from') ? 
          [fullOutTag, fullInTag] 
          // : [fullInTag, fullOutTag]
        )
        return tags
      }

      this.graph.onedgeadded = async (edge: GraphEdge) => {    

        if (this.config.gs) {
          let key = ( edge.input.tag === '__operator') ? '' : edge.input.tag
          const isFound = isListenerPort(key)
          if (isFound) key = undefined

          // setListeners
          // this.config.gs.setListeners({
          //   [edge.output.node.info.tag]: isFound ? edge.input.value : key
          // })
          edge.output.node.info.__subscribe(isFound ? edge.input.value : edge.input.node.info, key)
        } else if (this.config.esc){         
          let tags = getTags(edge)
          this.config.esc.__.listeners.add(tags[0], tags[1], edge.info)
        } else {
          console.error('New edge cannot be handled...')
        }

      }

      this.graph.onnodeadded = async (node) => {
        const activeGraph = this.config.graph

        if (this.config.esc) {
          const component = await this.createComponent(node.info, {
            parent: this.config.esc,
            name: node.tag
          })
          activeGraph.nodes[node.tag] = component
          node.info = component
        } else {
          console.error('Cannot handle this edit...')
        }

      }

      // Handle Removal Externally
      this.graph.onedgeremoved = async (edge) => {

        if (edge.input && edge.output){
          if (this.config.gs) edge.output.node.info.__unsubscribe(edge.info.sub, edge.info.key)
          else if (this.config.esc){
            const tags = getTags(edge)
            this.config.esc.__.listeners.remove(tags[0], tags[1])
          } else {
            console.error('Edge removal cannot be handled...')
          }
        }

      }

      this.graph.onnoderemoved = async (node) => {
        const activeGraph = this.config.graph
        if (this.config.esc){
          const activeNode = activeGraph.nodes[node.tag]
          activeNode.__ondisconnected()
          delete activeGraph.nodes[node.tag]
        }
      }

    }

    setGraph = async (graph) => {
      this.config.graph = graph
      await this.graph.set(this.config.graph) // Set tree on graph
    }

    setDependencyTree = (dep) => {
      this.config.dependencies = dep

      this.setPlugins(dep.files)

      const graph = {
        nodes: dep.files,
        edges: dep.dependencies
      }

      this.setGraph(graph) // forward to ESCode setter
    }


    addFile = (path: string, files: __source) => {
      if (path && files) {

        const trigger =  Object.keys(this.filesystem).length === 0

        let arrayFiles = (Array.isArray(files)) ? files : [files]

        const flattenDependencies = (f) => { 
          const isStr = typeof f === 'string'
          const all = [f]
          if (!isStr && f.dependencies) {
            const arr = Array.from(f.dependencies.values())
            all.push(...arr.map(flattenDependencies).flat())
          }
          return all
        }

        arrayFiles = arrayFiles.map(flattenDependencies).flat()

        arrayFiles.forEach(f =>  {
          if (typeof f === 'string') this.filesystem[path] = f
          else {
            const split = f.name.split('/')

            let target = this.filesystem
            const name = split.pop()
            split.forEach((s, i) => {
              if (!target[s]) target[s] = {}
              target = target[s]
            })

            target[name] = f
          }
        })

        this.setFilesystem(this.filesystem, trigger)
      }
    }

    setFilesystem = (filesystem, trigger?: boolean) => {
      this.filesystem = filesystem
      this.tree.set(this.filesystem)
      if (trigger) {
        this.fileUpdate = this.fileUpdate + 1
      }
    }

    createComponent = (config, nestedInfo: any = undefined) => {
      // Create an active ES Component from a .esc file
      return esc.create(config, { nested: nestedInfo  })
    }


    // Set GraphScript Object
    set = (gs) => {

      // const tree = gs.get('tree')
      // if (tree) gs = tree
      
      const attachedToThis = gs.__editorAttached === this
      this.config.original = this.config.gs = gs
      if (!attachedToThis) Object.defineProperty(gs, '__editorAttached', {value: this}) // Setting __editor to the component

      const edges = {}
      const isTop = !!gs.__node.nodes
      const nodes = gs.__node.nodes || gs.__node.graph.__node.nodes
      const cutoffTag = gs.__node.tag
      const include = (tag) => tag.slice(0, cutoffTag.length) === cutoffTag

      // Get Edges
      Object.values(gs.__node.state.triggers).forEach((arr: any, i) => {
        arr.forEach(o => {

            const sourceStr = (o.key) ? `${o.source}.${o.key}` : o.source
            const targetStr = (typeof o.target === 'string') ? o.target : `${o.bound}.[${o.target.constructor.name}_${i}]`

            // Filter edges for visualization
            if (isTop || (include(sourceStr) && include(targetStr))) {
              let source = edges[sourceStr]
              if (!source) source = edges[sourceStr] = {}
              source[targetStr] = o
            }
        })
      })

      // Get Nodes
      const graph = {
        nodes: new Map(Array.from(nodes.entries()).filter((args: any) => {
          const split = args[0].split('.')

          if (isTop) return split.length === 1 // Top level nodes
          else return (split.length > 1 && include(args[0])) // Nested nodes

        }) as any), // Only Top-Level Nodes
        edges
      }


      this.graph.workspace.edgeMode = 'from'

      this.setGraph(graph) // forward to ESCode setter

      return gs

    }


    // TODO: Assign ES Component types
    setComponent = (config: any = {}, ui = !this.bind) => {

      const component = ((config.hasOwnProperty(specialKeys.root)) ? config : this.createComponent(config)) as ESComponent
      const attachedToThis = config.__editorAttached === this

      this.config.original = this.config.esc = component

      const uiElement = (ui === true) ? component.__element : ui
      this.setUI(uiElement) // Maintain a reference to the true parent at esc.__parent

      if (!attachedToThis) Object.defineProperty(component, '__editorAttached', {value: this}) // Setting __editor to the component


      // Set Plugins from NPM
      fetch('https://registry.npmjs.org/-/v1/search?text=keywords:escomponent').then(async r => {
        const res = await r.json()

        const local = {}

        // Grabbing components from the current object
        const entries = component.__.components.entries()
        await esc.resolve(Array.from(entries).map(async ([key, component]) => {
          local[key] = component.__.original
        }))

        const npm = {}
        res.objects.forEach(o => npm[o.package.name] = o.package)

        this.setPlugins({
          ['Local']: {
            'This Component': component.__.original,
            ...local
          },
          ['NPM']: {
            ...npm, // TODO: Make sure you can actually query the code...
          },
          ['Included']: {
            ...components,
          },
        })

      })
    
      this.graph.workspace.edgeMode = 'to'

      // Only set if not bound (otherwise handled externally)
      const configuration = component[specialKeys.root] ?? {}
      const toSet = !this.bind || (configuration.editor.bound.length && configuration.editor.bound.includes(this))
      if (toSet) {

        const graph = {
          nodes: component.__.components.value,
          edges: component[specialKeys.listeners.value]
        }

        const isReady = component.__resolved
        if (isReady) isReady.then(() => this.setGraph(graph))
        else this.setGraph(graph)
      }

      return component
    }

    setPlugins = (plugins) => {
      this.graph.plugins = plugins
    }


    setUI = (ui) => {
        this.uiContainer.innerHTML = ''
        this.ui.style.width = `0px`

        if (ui) {
          this.ui.style.width = `100%`
          this.uiContainer.appendChild(ui)
        }

        this.ui.appendChild(this.console)

    }

    isPlugin = (f) => {
      return f.mimeType === 'application/javascript' && !f.path.includes('/.brainsatplay/')
    }

    start = async () => {

      // TODO: Reset File Viewer with Same Tabs Open
      // const toOpen: any[] = []
      // this.files.tabs.forEach(t => {
      //   const newTab = system.files.list.get(t.name)
      //   toOpen.push(newTab)
      // })
      this.files.reset() 

      const previousTabs = new Set(Object.keys(this.history))

      // TODO: Only Show ESM at Top Level. Show editable things
      // const isValidPlugin = this.isPlugin(f)


      // Add Tab On Click
      this.tree.oncreate = async (type, item) => {

        if (type === 'file') {
          if (this.onCreateFile){
            const path = item.key
            const rangeFile = this.onCreateFile() //this.config.app.filesystem.open(path, true)
            return rangeFile
          } else console.error('Cannot create file...')
        }
      }

      this.tree.onClick = async (key, obj) => {
        
        if (Array.isArray(obj)) obj = obj[0] // Only grab first...

        const isFile = true //!!obj.path
        const id = obj.path ?? key
        const existingTab = this.files.tabs.get(id)
        if (!existingTab){

        let tabInfo = this.history[id]
        // const plugin = this.config.app.plugins.plugins[f.path]
  
        previousTabs.delete(id)

        const tab = new Tab({
          close: true,
          name: id
        })

        if (tabInfo) tabInfo.tab = tab
        else {
          
          tabInfo = {tab} // Start tracking essential tab information

          // Create File Editors
          tabInfo.container = new Panel({minTabs: 2})
          const codeTab = new Tab({name: "File"});

          // Conditionally Show Information
          if (isFile) {
            const isPlugin = this.isPlugin(obj)
            if (isPlugin){
              const infoTab = new Tab({name: 'Info'})
              tabInfo.plugin = new Plugin()
              infoTab.appendChild(tabInfo.plugin)
              tabInfo.container.addTab(infoTab)
            }
          }

          // Always Show Code Editor
          if (isFile){
            tabInfo.code = new CodeEditor()
            codeTab.appendChild(tabInfo.code)
            tabInfo.container.addTab(codeTab)
          }
        }

        tab.appendChild(tabInfo.container)
        this.files.addTab(tab, true)
        this.history[id] = tabInfo
        
        // ---------- Update Editors ----------

        // const canGet = {
        //   metadata: this.config.app.plugins.metadata,
        //   package: this.config.app.plugins.package,
        //   module: this.config.app.plugins.module
        // }

        // let metadata = (canGet.metadata) ? (await this.config.app.plugins.metadata(obj.path) ?? await obj.body) : undefined
        // const module = (canGet.module) ? await this.config.app.plugins.module(obj.path) : obj.operator
        // const pkg = (canGet.package) ? await this.config.app.plugins.package(obj.path) : undefined

        // // Merge package with metadata
        // if (pkg) metadata = Object.assign(JSON.parse(JSON.stringify(pkg)), metadata)

        // // Plugin Info
        // if (tabInfo.plugin) {
        //   tabInfo.plugin.set( module, metadata )
        // }

        // // Object Editor
        // if (tabInfo.object){
        //   tabInfo.object.set(module)
        //   tabInfo.object.header = metadata.name ?? obj.name ?? obj.tag
        // }

        // Code Editor
        if (tabInfo.code && isFile){
          const text = obj.info.text.original // Always get the original text

          tabInfo.code.value = text

          let tmpVar = undefined
          const tempSave = (isFile) ? (text) => obj.text = text : (text) => tmpVar = text
          tabInfo.code.onInput = tempSave,
          tabInfo.code.onSave = async () => {
              await obj.save()
              // await this.config.app.start() // TODO: restart the app
          }
        }

        // openTabs[id] = tabInfo.tab
      } else {
        existingTab.toggle.select()
      }
    } 

    // Remove Tabs That No Longer Exist
    previousTabs.forEach(str => {
      const info = this.history[str]
      info.tab.remove() // Remove
      delete this.history[str]
    })


    let treeObject = this.filesystem // this.config.app.filesystem?.files?.system
    this.tree.set(treeObject ?? {})

    this.fileUpdate = this.fileUpdate + 1

    }

    render() {

      // const addBox = new Icon({type: 'addBox'})
      // addBox.id = 'palette'

      const projectTab =  new Tab({name: 'Project', type:'dropdown'})
      const projectOptions = [
        { label: 'New', onclick: () =>  console.log('Coming soon...') }, // Create a new project

        // Open project
        { label: 'Open', onclick: () => this.modal.open = true },
        { label: 'Open from template', onclick: () => this.modal.open = true },
        { label: 'Open from filesystem', onclick: () => console.log('Coming soon...') },

        // Save
        { label: 'Save', onclick: () => console.log('Coming soon...') }, // Save locally
        { label: 'Save to filesystem', onclick: () => console.log('Coming soon...') }, // Save to filesystem

        // Management Methods
        { label: 'Reset', onclick: () => console.log('Coming soon...') }, // Reset to original configuration
        { label: 'Manage', onclick: () => console.log('Coming soon...') }, // Manage changes
      ]

      projectOptions.forEach(o => {
        const option = document.createElement('div')
        option.innerHTML = o.label
        projectTab.insertAdjacentElement('beforeend', option)
        option.onclick = o.onclick
      })


      const tabs = [projectTab]

      const panel = new Panel({minTabs: 2})
      if (this.views.graph) {
        const graphTab = new Tab({name: 'Graph'})
        if (this.graph) graphTab.appendChild(this.graph)

        // Add Tabs
        panel.addTab(graphTab)
    }

      if (this.views.files){
        if (Object.keys(this.filesystem).length) panel.addTab(this.filesTab)
      }

      if (this.views.properties){
        panel.addTab(this.propertiesTab)
        this.properties.set(this.config.original, {base: true})
      }

  //     <visualscript-tab-bar>
  //     ${tabs.map(t => t.toggle)}
  // </visualscript-tab-bar>
      if (this.views.menubar) {
        this.menubar.tabs = tabs
      }

      document.body.insertAdjacentElement('afterend', this.modal)
      return html`
        ${this.views.menubar ? this.menubar : ''}
        <div>
          ${panel.tabs.size ? panel : ''}
          ${this.views.ui ? this.ui ?? '' : ''}
        </div>
      `

    }
  }
  
  customElements.define('escode-editor', Editor);