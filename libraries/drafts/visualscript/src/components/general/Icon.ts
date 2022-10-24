import { LitElement, html, css } from 'lit';
import * as icons from './icons'

export interface IconProps {
  type?: string;
}

export class Icon extends LitElement {

  static get styles() {
    return css`

    :host {
      display: block;
      width: 30px;
      height: 30px;
      box-sizing: border-box;
    }

    svg {
      width: 100%;
      height: 100%;
      fill: black;
    }

    @media (prefers-color-scheme: dark) {

      svg {
        fill: rgb(210, 210, 210);
      }
    }

    `;
  }
    
    static get properties() {
      return {
        type:  {
          type: String,
          reflect: true
        },
      };
    }


    type: IconProps['type']

    constructor(props: IconProps = {}) {
      super();

      this.type = props.type ?? 'folder'
    }
  
    render() {

      return html`
       ${icons[this.type]}
    `
    }
  }
  
  customElements.get('visualscript-icon') || customElements.define('visualscript-icon',  Icon);