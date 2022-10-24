
import { LitElement, html, css } from 'lit';
import {until} from 'lit-html/directives/until.js';

import { TimeSeries } from '../plots';
import {Input} from '../input/Input'

type keyType = string | number | symbol
export type ObjectEditorProps = {
  target: {[x:string]: any}
  header?: keyType
  mode?: string
  plot?: Function[],
  onPlot?: Function
  preprocess?: Function
}

export class ObjectEditor extends LitElement {

  static get styles() {
    return css`

    :host * {
      font-family: var(--visualscript-font-family, sans-serif);
      box-sizing: border-box;
    }

    :host > * {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
      height: 100%;
      width: 100%;
      position: relative;
    }

    img {
      max-height: 100px;
    }

    .header {
      padding: 5px 10px;
      font-size: 70%;
      text-align: right;
    }

    .header span {
      font-weight: 800;
      font-size: 120%;
    }

    .container {
      width: 100%;
      padding: 10px;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: scroll;
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
        box-shadow: 0 1px 5px 0 rgb(255 255 255 / 20%);
      }

      .header {
        border-bottom: 1px solid gray;
      }
    }

    `;
  }
    
    static get properties() {
      return {
        // target: {
        //   type: Object,
        //   reflect: false,
        // },
        keys: {
          type: Object,
          reflect: true,
        },
        plot: {
          type: Object,
          reflect: true,
        },
        header: {
          type: String,
          reflect: true,
        },
        mode: {
          type: String,
          reflect: true,
        },
        onPlot: {
          type: Function,
          reflect: true,
        },
        preprocess: {
          type: Function,
          reflect: true,
        },
      };
    }

    target: ObjectEditorProps['target']
    keys: (keyType)[]
    header: ObjectEditorProps['header']
    history: any[] = []
    plot: ObjectEditorProps['plot']
    onPlot: ObjectEditorProps['onPlot']
    preprocess: ObjectEditorProps['preprocess']

    mode: string
    timeseries: TimeSeries

    constructor(props: ObjectEditorProps = {target: {}, header: 'Object'}) {
      super();

      this.set(props.target)
      this.header = props.header ?? 'Object'
      this.mode = props.mode ?? 'view'
      this.plot = props.plot ?? []
      this.onPlot = props.onPlot
      if (props.preprocess) this.preprocess = props.preprocess

      this.timeseries = new TimeSeries({
        data: []
      })
    }

    getMode = (target, plot) => {
      return (plot) ? 'plot' : 'view' 
    }

    set = async (target={}, plot=false) => {
      if (this.preprocess instanceof Function) this.target = await this.preprocess(target)
      else this.target = target
      this.keys = Object.keys(this.target).sort()
      this.mode = this.getMode(this.target, plot)
    }

    checkToPlot = (key, o) => this.plot.length !== 0 && this.plot.reduce((a,f) => a + f(key, o), 0) === this.plot.length

    getActions = async (key:keyType, o:any) => {

      let actions;

      const val = await Promise.resolve(o[key])

      if (typeof val === 'object') {
        const mode = this.getMode(val, this.checkToPlot(key,o))
        actions = html`<visualscript-button primary=true size="small" @click="${async () => {
          this.history.push({parent: o, key: this.header})
          await this.set(val, this.checkToPlot(key,o))
          this.header = key
        }}">${mode[0].toUpperCase() + mode.slice(1)}</visualscript-button>`
      }

      return html`
      <div class="actions">
            ${actions}
      </div>
      `
    }


    getElement = async (key:keyType, o: any) => {
        let display;

        const val = await Promise.resolve(o[key])

        if (typeof val === 'string' && val.includes('data:image')) {
          display = document.createElement('img') as HTMLImageElement
          display.src = val
          display.style.height = '100%'
        } else {
          display = new Input()
          display.value = val
          display.oninput = () => {
            o[key] = display.value // Modify original data
          }
        }

        const isObject = typeof val === 'object' 

        return html`
        <div class="attribute separate">
        <div class="info">
          <span class="name">${key}</span><br>
          <span class="value">${(val ? (
            (isObject)
            ? (Object.keys(val).length ? val.constructor?.name : html`Empty ${val.constructor?.name}`)
            : '') : val)}</span>
        </div>
          ${val && isObject ? await this.getActions(key, o) : display}
        </div>`

    }
  
    render() {

      if (this.mode === 'plot') {
        if (this.onPlot instanceof Function) this.onPlot(this)
        this.insertAdjacentElement('afterend', this.timeseries)
      } else this.timeseries.remove()

      const content = (
        this.mode === 'view' 
        ? this.keys?.map(key => this.getElement(key, this.target)) 
        : []
      )

      return until(Promise.all(content).then((data) => {

        return html`
        <div>
          <div class="header">
            ${ (this.history.length > 0) ? html`<visualscript-button size="extra-small" @click="${() => {
                const historyItem = this.history.pop()
                this.set(historyItem.parent)
                this.header = historyItem.key
            }}">Go Back</visualscript-button>` : ``}
          </div>
          <div class="container">
                ${data}
          </div>
        </div>
      `
      }), html`<span>Loading...</span>`)

    }
  }
  
  customElements.get('visualscript-object-editor') || customElements.define('visualscript-object-editor',  ObjectEditor);