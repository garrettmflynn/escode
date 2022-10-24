import { LitElement, html, css } from 'lit';
import './Button'

export interface ModalProps {
  open?: boolean;
  header?: string;
  footer?: string;

  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional click handler
   */
  onClick?: () => void;
  onClose?: () => void;
  onOpen?: () => void;

}

export class Modal extends LitElement {

  static get styles() {
    return css`
/* Modal Header */

  :host {
    font-family: var(--visualscript-font-family, sans-serif);
    z-index: 101;
  }
  
  :host * {
    box-sizing: border-box;
    
  }

.modal-header {
  padding: 12px 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid #e3e3e3;
}

.modal-header span {
  font-weight: 800;
  font-size: 120%;
}


/* Modal Body */
.modal-body {
  padding: 16px;
  overflow: scroll;
  width: 100%;
  flex-grow: 1;
}

/* Modal Footer */
.modal-footer {
  border-top: 1px solid #e3e3e3;
  padding: 12px 16px;
  width: 100%;
}

.modal-footer span {
  font-size: 80%;
}

/* Modal Content */
.modal-content {
  
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);

  background-color: #fefefe;
  margin: auto;
  border-radius: 4px;
  padding: 0;
  width: 80vw;
  height: 80vh;
  box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
  transition: opacity 0.5s;
  display: flex; 
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  pointer-events: none;
  z-index: 102;
  opacity: 0;
}

.modal-content.open {
  opacity: 1;
  pointer-events: all;
}

    `;
  }
    
    static get properties() {
      return {
        open:  {
          type: Boolean,
          reflect: true
        },
         header:  {
          type: Object,
          reflect: true
        },
         footer:  {
          type: String,
          reflect: true
        },
      };
    }

    open: ModalProps['open']
    header: ModalProps['header']
    footer: ModalProps['footer']
    onClose: ModalProps['onClose']
    onOpen: ModalProps['onOpen']

    backgroundColor: ModalProps['backgroundColor']
    size: ModalProps['size']

    constructor(props: ModalProps = {}) {
      super();

      this.open = props.open
      this.header = props.header
      this.footer = props.footer
      this.onClose = props.onClose

    }
    
    willUpdate(_:any) {
      // console.log(changedProps)
      // if (changedProps.has('type')) {

      // }
    }

    toggle = () => {
      this.open = !this.open

      if (!this.open) this.onClose()
      else this.onOpen()

    }

    render() {

      const span = document.createElement('span')
      span.innerHTML = this.footer
      return html`
      <div class="modal-content ${this.open ? 'open' : ''}">
      <div class="modal-header">
          <span>${this.header}</span>
          <visualscript-button secondary size="extra-small" @click="${this.toggle}">Close</visualscript-button>
        </div>
        <div class="modal-body">
          <slot>No content</slot>
        </div>
        ${(this.footer) ? html`<div class="modal-footer">${span}</div>` : ''}
      </div>
      <visualscript-overlay .open=${this.open}></visualscript-overlay>
    `
    }
  }
  
  customElements.get('visualscript-modal') || customElements.define('visualscript-modal',  Modal);