
import { LitElement, html, css } from 'lit';
import './Workspace';
import { GraphWorkspace } from './Workspace';
import context from '../../instances/context'
import { Modal, Overlay } from '../general';
import { Tree } from '../tree';

type keyType = string | number | symbol
export type GraphEditorProps = {
  graph: waslGraph,
  plugins: {[x:string]: waslNode[] | GraphEditorProps['plugins']}
  plot?: Function[],
  onPlot?: Function
  preprocess?: Function
}

export class GraphEditor extends LitElement {

  static get styles() {
    return css`

    :host * {
      box-sizing: border-box;
    }

    img {
      max-height: 100px;
    }

    .container {
      width: 100%;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 100%;
    }

    .separate {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .attribute {
      width: 100%;
      font-size: 90%;
      padding: 15px;
      flex-grow: 1;
      flex-wrap: wrap;
    }

    .info {
      display: flex;
      align-items: center;
    }

    .name {
      font-weight: 800;
      padding-right: 10px;
    }

    .value {
      font-size: 80%;
    }

    @media (prefers-color-scheme: dark) {
      :host > * {
        background-color: rgb(40, 40, 40);
      }
    }

    `;
  }
    
    static get properties() {
      return {

      };
    }

    graph: GraphEditorProps['graph']
    plugins: GraphEditorProps['plugins']
    history: any[] = []
    workspace: GraphWorkspace
    onedgeadded: GraphWorkspace['onedgeadded']
    onedgeremoved: GraphWorkspace['onedgeremoved']
    onnodeadded: GraphWorkspace['onnodeadded']
    onnoderemoved: GraphWorkspace['onnoderemoved']

    constructor(props?: GraphEditorProps) {
      super();

      // Define Setters and Getters for Workspace Events
      const events = ['onedgeadded', 'onedgeremoved', 'onnodeadded', 'onnoderemoved']
      events.forEach(ev => {
        Object.defineProperty(this, ev, {
          get: () => this.workspace[ev],
          set: (f) => this.workspace[ev] = f
        })
      })

      this.workspace = new GraphWorkspace(props)
      if (props) this.set(props.graph)
      this.plugins = props?.plugins ?? {}

            // Setting Context Menu Response
            if (!context.parentNode) document.body.appendChild(context)
            context.set('visualscript-graph-editor', {
              condition: (el) => {
                const root =  this.workspace.shadowRoot
                if (root){
                  return el ===  this.workspace // Is the workspace
                  || root.contains(el) // Is the workspace grid
                } else return false
              },
              contents: (ev) => {
                return [
                  {
                    text: 'Create new node',
                    onclick: async () => {

                      var rect = this.workspace.element.getBoundingClientRect();
                      var x = ev.clientX - rect.left; //x position within the element.
                      var y = ev.clientY - rect.top;  //y position within the element.
                      

                      // Blur the Background
                      const overlay = new Overlay()

                      // Create a Modal
                      const modal = new Modal({open: true, header: 'Plugins', footer: '<small>All plugins can be found on the <a href="https://github.com/brainsatplay/plugins">plugins</a>repository.</small>'})
                      overlay.appendChild(modal)

                      modal.onClose = () => {
                        overlay.open = false
                      }

                      // Show Node Options in a List
                      const info = await new Promise((resolve) => {

                        const list = new Tree({
                          target: this.plugins,
                          conditions: {
                            value: (o) => {
                              return 'tag' in o
                             } // wasl nodes always have a tag
                          },
                          onClick: (_, thing:any) => resolve(Object.assign({}, thing)) // pass a shallow copy onwards
                        })
                        modal.appendChild(list)
                        this.workspace.parentNode.appendChild(overlay)
                        overlay.open = true
                      }) as waslNode

                      // Add essential info
                      info.tag = `${info.tag}_${Math.floor(1000*Math.random())}` // generate tag from plugin

                      // extend info for visualscript
                      delete info?.extensions?.visualscript // delete existing instance-specific info
                      this.workspace.addNode({info, x, y})
                      modal.open = false
                      overlay.open = false
                  },
                },
                //    {
                //     text: 'Do another thing',
                //     onclick: () => {
                //       console.warn('MUST DO SOMETHING')
                //   }
                // }
                ]
              }
            })
    }

    set = async (graph) => {
      this.graph = graph
      await this.workspace.set(this.graph)
    }

    render() {


      // return until(Promise.all(content).then((data) => {
        
        return html`
        <div class="container">
          ${this.workspace}
        </div>
      `
      // }), html`<span>Loading...</span>`)

    }
  }
  
  customElements.get('visualscript-graph-editor') || customElements.define('visualscript-graph-editor',  GraphEditor);