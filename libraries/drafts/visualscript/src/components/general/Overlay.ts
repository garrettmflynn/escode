
import { LitElement, html, css } from 'lit';

export type OverlayProps = {
  open?: boolean,
}

export class Overlay extends LitElement {

  static get styles() {
    return css`

    :host {
      font-family: var(--visualscript-font-family, sans-serif);
    }

    div {
      opacity: 0;
      width: 100vw;
      height: 100vh;
      transition: 2.0s;
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 50;
      color: black;
    }

    :host([open]) div {
      opacity: 1;
      pointer-events: all;
      backdrop-filter: blur(3px);
    }

    @media (prefers-color-scheme: dark) {
      div {
        color: white;
      }
    }

    `;
  }
    
    static get properties() {
      return {
        open: {
          type: Boolean,
          reflect: true,
        }
      };
    }

    open: boolean = false

    constructor(props: OverlayProps = {}) {
      super();

      this.open = props.open ?? false
    }
    
    render() {

      return html`
      <div>
        <slot></slot>
      </div>
    `
    }
  }
  
  customElements.get('visualscript-overlay') || customElements.define('visualscript-overlay',  Overlay);