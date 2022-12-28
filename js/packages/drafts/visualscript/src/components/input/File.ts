
import { LitElement, html, css } from 'lit';

export type FileProps = {
  accept?: string // e.g. "audio/*, video/*"
  onChange?: (ev: Event)=> any
  webkitdirectory?: boolean
  directory?: boolean 
  multiple?: boolean
}

export class File extends LitElement {

  onChange: FileProps['onChange'] = () => {}
  accept: FileProps['accept']
  webkitdirectory: FileProps['webkitdirectory'] 
  directory: FileProps['directory'] 
  multiple: FileProps['multiple']

  static get styles() {
    return css`

    :host {
      font-family: var(--visualscript-font-family, sans-serif);
      
      display: flex;
      justify-content: center;
      overflow: hidden;
    }
    
    input[type=file] {
      display: none;
    }

    :host * {
      box-sizing: border-box;
    }
    
    button {
      flex: auto;
      padding: 8px 12px;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      border: none;  
      color: #ffffff;
      background-color: var(--visualscript-primary-color, #1ea7fd);
      width: 100%;
      cursor: pointer;    
      /* white-space: nowrap; */
      font-weight: bold;
    }

    .hide {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      border: 0;
    }

    input[type=text] {
      flex-grow: 1;
      padding: 10px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border: none;
      overflow: hidden;
    }

    input[type=text] {
      flex-grow: 1;
      padding: 8px 8px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border: none;
      color: black;
      background-color: white;
    }

    @media (prefers-color-scheme: dark) {
      input[type=text] {
        color: white;
        background-color: rgb(59, 59, 59);
      }
    }
    
    `;
  }
    
    static get properties() {
      return {
          accept: {
            type: String,
            reflect: true
          },
          onChange: {
            type: Function,
            reflect: true
          },
          webkitdirectory: {
            type: Boolean,
            reflect: true
          },
          directory: {
            type: Boolean,
            reflect: true
          },
          multiple: {
            type: Boolean,
            reflect: true
          },
      };
    }

    constructor(props: FileProps = {}) {
      super();
      
      if (props.accept) this.accept = props.accept
      if (props.onChange) this.onChange = props.onChange
      if (props.webkitdirectory) this.webkitdirectory = props.webkitdirectory
      if (props.directory) this.directory = props.directory
      if (props.multiple) this.multiple = props.multiple
    }
    
    render() {

      const input = document.createElement('input') as any
      input.type = 'file'
      input.id = 'fileupload'
      input.accept = this.accept
      input.webkitdirectory = this.webkitdirectory
      input.directory = this.directory
      input.multiple = this.multiple
      input.onchange = (ev) => {
        const lenFiles = ev.target.files.length
        const fileUploaded = ev.target.files[0];
        const input = this.shadowRoot.querySelector('input[type=text]') as HTMLInputElement
        var filename = (lenFiles === 1) ? fileUploaded.name : `${lenFiles} files`
        input.value = filename
        input.placeholder = filename
        input.focus()
        this.onChange(ev);
      }

      return html`
      <label for="fileupload" id="buttonlabel">
        <button aria-controls="filename" tabindex="0" @click=${() => {
          if (input) input.click()
        }}>Choose File</button>
      </label>
      ${input}
      <label for="filename" class="hide">
        uploaded file
      </label>
      <input type="text" id="filename" autocomplete="off" readonly placeholder="no file chosen">  
    `
    }
  }
  
  customElements.get('visualscript-file') || customElements.define('visualscript-file',  File);