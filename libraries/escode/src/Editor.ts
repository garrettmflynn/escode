
import { LitElement, html, css } from 'lit';

// Internal Dependencies
import { Plugin } from './Plugin';

// Visualscript Dependencies
import { Tab, Panel, Tree, CodeEditor, ObjectEditor, GraphEditor, Modal, global } from "../../drafts/visualscript/src/index"
import { GraphEdge } from '../../drafts/visualscript/src/components/graph/Edge';

// ESCompose and ESMonitor Dependencies
import Monitor from '../../esmonitor/src/Monitor';
import createComponent from '../../escompose/src/index'

// Default ES Component Pool for Plugins
import * as components from '../../../components/index.js'


export type EditorProps = {
  app?: any, // brainsatplay.editable.App
  plugins?: any[]
  ui?: HTMLElement
}

export class Editor extends LitElement {

  static get styles() {
    return css`

    :host { 
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    :host > div > * {
      flex-grow: 1;
    }

    :host > div {
      display: flex;
      width: 100%;
      height: 100%;
    }

    #files {
      display: flex;
      height: 100%;
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
      app?: any,
      dependencies?: any,
      graph: any,
    } = {
      esc: undefined,
      app: undefined,
      dependencies: undefined,
      graph: undefined,
    }

    esc: {
      monitor?: Monitor,
      listeners: { static: boolean }
    } = {
      monitor: undefined,
      listeners: { static: true }
    }

    modal = new Modal()
    ui = document.createElement('visualscript-tab') 
    files = new Panel()
    filesTab = new Tab({name: 'Files'})

    info = new Panel()
    history: {[x:string]: any} = {}
    fileUpdate: number = 0
    graph = new GraphEditor()
    properties = new ObjectEditor()
    tree = new Tree({
      target: {},
      mode: 'filesystem'
    })

    constructor(props:EditorProps={}) {
      super();

      this.ui.setAttribute('name', 'UI')
      if (props.app) this.setApp(props.app)
      if (props.ui) this.setUI(props.ui)

      // Setup Files Tab
      const div = document.createElement('div')
      div.id = 'files'
      div.appendChild(this.tree)
      div.appendChild(this.files)
      this.filesTab.appendChild(div)

      // -------------------- Setup ESCode x visualscript interface --------------------

      const getTags = (edge) => {
        const fullOutTag = `${edge.output.node.tag}.${edge.output.tag}`
        const fullInTag = `${edge.input.node.tag}.${edge.input.tag}`
        const checkFor = '.default' // no default
        const tags =  (
          // (this.graph.workspace.edgeMode  === 'from') ? 
          [fullOutTag, fullInTag] 
          // : [fullInTag, fullOutTag]
        ).map(str => (str?.slice(-checkFor.length) === checkFor) ? str.slice(0, -checkFor.length) : str)
        return tags
      }

      this.graph.onedgeadded = async (edge: GraphEdge) => {    

        if (this.config.esc){         
          let tags = getTags(edge)
          this.config.graph.edges.__manager.add(tags[0], tags[1], edge.info)
        } else {
          console.error('New edge cannot be handled...')
        }

      }

      this.graph.onnodeadded = async (node) => {
        const activeGraph = this.config.graph

        if (this.config.esc) {
          const component = this.createComponent(node.info, {
            parent: this.config.esc,
            name: node.tag
          })
          activeGraph.nodes[node.tag] = component
          node.info = component
          component.esParent = this.config.esc.esElement
        } else {
          console.error('Cannot handle this edit...')
        }

      }

      // Handle Removal Externally
      this.graph.onedgeremoved = async (edge) => {

        if (edge.input && edge.output){
          if (this.config.esc){
            const tags = getTags(edge)
            this.config.graph.edges.__manager.remove(tags[0], tags[1], edge.info)
          } else {
            console.error('Edge removal cannot be handled...')
          }
        }

      }

      this.graph.onnoderemoved = async (node) => {
        const activeGraph = this.config.graph
        if (this.config.esc){
          const activeNode = activeGraph.nodes[node.tag]
          activeNode.esDisconnected()
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

    createComponent = (esc, nestedInfo: any = undefined) => {
      if (!this.esc.monitor) {
        this.esc.monitor = new Monitor({
          // onInit: logUpdate,
          // onUpdate: {
          //     callback: logUpdate,
          //     info: {
          //         performance: true
          //     }
          // },
          pathFormat: 'absolute',
          polling: { sps: 60 }
      })
    }

      // Create an active ES Component from a .esc file
      return createComponent(esc, {
        ...this.esc,
        nested: nestedInfo
      })
    }

    // TODO: Assign ES Component types
    setComponent = (esc: any = {}) => {

      const component = (esc.hasOwnProperty('__isESComponent')) ? esc : this.createComponent(esc) 

      this.config.esc = component
      component.esParent = this.ui // TODO: Cache the original position

      const local = {}
      for (let key in component.esDOM) local[key] = component.esDOM[key].esOriginal
      
      this.setPlugins({
        ['Local Components']: {
          ...component.esComponents,
          ...local
        },
        ['Component Registry']: {
          ...components,
        }
      })

      const graph = {
        nodes: component.esDOM,
        edges: component.esListeners
      }

      this.graph.workspace.edgeMode = 'to'

      this.setGraph(graph) // forward to ESCode setter

      return component
    }

    setApp = (app) => {
      this.config.app = app // keep app reference
      this.setComponent(app.esc) // forward to ESCode setter
    }

    setPlugins = (plugins) => {
      this.graph.plugins = plugins
    }


    setUI = (ui) => {
      this.ui.innerHTML = ''
      this.ui.appendChild(ui)
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

      const allProperties = {}

      // TODO: Only Show ESM at Top Level. Show editable things
      // const isValidPlugin = this.isPlugin(f)

      const openTabs: {[x:string]: any} = {}

      // show/hide files tab
      if (this.config.app?.filesystem) {

      // Add Tab On Click
      this.tree.oncreate = async (type, item) => {

        if (type === 'file') {
          const path = item.key
          const rangeFile = this.config.app.filesystem.open(path, true)
          return rangeFile
        }
      }

      this.tree.onClick = async (key, obj) => {

        const isFile = !!obj.path
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

          // Show Property Editor for Objects (including esm modules)
          // if (typeof await f.body === 'object') {
          //   const objectTab = new Tab({name: "Properties"})
          //   tabInfo.object = new ObjectEditor()
          //   objectTab.appendChild(tabInfo.object)
          //   container.addTab(objectTab)
          // }

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

        const canGet = {
          metadata: this.config.app.plugins.metadata,
          package: this.config.app.plugins.package,
          module: this.config.app.plugins.module
        }

        let metadata = (canGet.metadata) ? (await this.config.app.plugins.metadata(obj.path) ?? await obj.body) : undefined
        const module = (canGet.module) ? await this.config.app.plugins.module(obj.path) : obj.operator
        const pkg = (canGet.package) ? await this.config.app.plugins.package(obj.path) : undefined

        // Merge package with metadata
        if (pkg) metadata = Object.assign(JSON.parse(JSON.stringify(pkg)), metadata)

        // Plugin Info
        if (tabInfo.plugin) {
          tabInfo.plugin.set( module, metadata )
        }

        // Object Editor
        if (tabInfo.object){
          tabInfo.object.set(module)
          tabInfo.object.header = metadata.name ?? obj.name ?? obj.tag
        }

        // Code Editor
        if (tabInfo.code){
          const text = (isFile) ? await obj.text : obj.operator.toString()
          tabInfo.code.value = text

          let tmpVar = undefined
          const tempSave = (isFile) ? (text) => obj.text = text : (text) => tmpVar = text
          tabInfo.code.onInput = tempSave,
          tabInfo.code.onSave = async () => {

              if (isFile) await obj.save()
              else obj.operator = (0,eval)(tmpVar)

              await this.config.app.start()
          }
        }

        openTabs[id] = tabInfo.tab
      } else {
        existingTab.toggle.select()
      }
    } 
  }


    this.properties.set(allProperties)

    // Remove Tabs That No Longer Exist
    previousTabs.forEach(str => {
      const info = this.history[str]
      info.tab.remove() // Remove
      delete this.history[str]
    })


    let treeObject = this.config.app.filesystem?.files?.system
    this.tree.set(treeObject ?? {})

    this.fileUpdate = this.fileUpdate + 1

    }

    render() {


      // const addBox = new Icon({type: 'addBox'})
      // addBox.id = 'palette'

      const newProject = document.createElement('div')
      newProject.innerHTML = 'Create new project'
      const fileTab =  new Tab({name: 'File', type:'dropdown'})
      fileTab.insertAdjacentElement('beforeend', newProject)
      newProject.onclick = () => {
        this.modal.open = true
      }

      const tabs = [
        fileTab,
        new Tab({name: 'Edit', type:'dropdown'}),
        new Tab({name: 'View'}),
        new Tab({name: 'Window'}),
        new Tab({name: 'Help'}),
      ]

      const panel = new Panel({minTabs: 2})
      const graphTab = new Tab({name: 'Graph'})
      graphTab.appendChild(this.graph)
      panel.addTab(graphTab)
      if (this.config.app?.filesystem) panel.addTab(this.filesTab)

      // return html`
      //     ${this.modal}
      //     <visualscript-tab-bar>
      //       ${tabs.map(t => t.toggle)}
      //     </visualscript-tab-bar>


    //   <visualscript-tab name="Properties">
    //   ${this.properties}
    // </visualscript-tab>
      return html`
          <div>
            ${this.ui}
            ${panel}
          </div>
      `

    }
  }
  
  customElements.define('brainsatplay-editor', Editor);