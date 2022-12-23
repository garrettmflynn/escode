
import { LitElement, html, css } from 'lit';
import {getFnParamInfo} from './utils/parse'

export type PluginProps = {
  // tag?: string,
  plugin?:any
}

export class Plugin extends LitElement {

  static get styles() {
    return css`

    :host * {
      box-sizing: border-box;
    }

    :host > * {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
      height: 100%;
      width: 100%;
    }

    img {
      max-height: 100px;
    }

    .header {
      padding: 10px 20px;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      font-size: 70%;
      border-bottom: 1px solid #e3e3e3;
    }

    .header span {
      font-weight: 800;
      font-size: 120%;
    }

    .container {
      width: 100%;
      padding: 10px;
      align-items: flex-start;
      justify-content: flex-start;
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
        metadata: {
          type: Object,
          reflect: true,
        },
      };
    }

    // tag: string
    // plugin: {[x:string]: any}
    module: any = {}
    metadata: any = {}

    constructor(props={}) {
      super();
    }

    set = (imported, metadata) => {
      this.module = imported
      this.metadata = metadata
    }

    render() {
      const operator = this.module.operator ?? this.module.looper ?? this.module.animation


      const params = operator ? getFnParamInfo(operator) : new Map()
      const paramEls = Array.from(params.entries()).map(([key, value]) => {
        const p = document.createElement('p')
        p.innerHTML = `<p><small><b>${key}:</b> ${JSON.stringify(value)}</small></p>`
        return p 
      })

      return html`
        <div>
          <div class="header separate">
            <span>${this.metadata.name ?? 'Tag'}</span>
          </div>
          <div class="container">
            <h4>Author</h4>
            <p>${this.metadata.author}</p>

            <h4>Description</h4>
            <p>${this.metadata.description}</p>

            ${operator ? html`
              <h4>Operator Arguments</h4> 
              ${paramEls}
              ` : ''}
          </div>
        </div>
      `

    }
  }
  
  customElements.define('brainatplay-plugin', Plugin);