
import { LitElement, html, css } from 'lit';

export type SidebarHeaderProps = {

}


export class SidebarHeader extends LitElement {

  static get styles() {
    return css`

    :host {
      width: 100%;
    }

    h4 {
      background: rgb(25, 25, 25);
      color: white;
      margin: 0px;
      padding: 10px 25px;
    }

    @media (prefers-color-scheme: dark) {
      h4 {
        color: black;
        background: rgb(60, 60, 60);
      }
    }

    `;
  }
    
    static get properties() {
      return {

      };
    }

    constructor(props: SidebarHeaderProps = {}) {
      super()

    }
  
    render() {
      
      return html`
          <h4><slot></slot></h4>
      `
    }
  }
  
  customElements.get('visualscript-sidebar-header') || customElements.define('visualscript-sidebar-header',  SidebarHeader);