
import { LitElement, html, css } from 'lit';
import { Icon } from '../general/Icon';
// import { Tree } from './Tree';


const valueStrings = ['file', 'value']
const filesystemStrings = ['file', 'folder', 'openfolder']

type keyType = string
export type TreeItemProps = {
  type?: string | 'folder' | 'openfolder' | 'file' | 'value' | 'object'
  key?: keyType,
  parent: any,
  value?: any,
  onClick: Function
}

export class TreeItem extends LitElement {

  static get styles() {
    return css`

    :host {
      font-family: var(--visualscript-font-family, sans-serif);
    }

    :host * {
      box-sizing: border-box;
    }

    li {
        width: 100%;
    }

    #itemHeader {
      position: relative;
    }

    #background {
      background: transparent;
      filter: alpha(opacity=40);
      /* IE */
      -moz-opacity: 0.4;
      /* Mozilla */
      opacity: 0.4;
      /* CSS3 */
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }

    #text {
        display: flex;
        font-size: 12px;
        padding: 6px;
        flex-grow: 1;
        align-items: center;
        user-select: none;
        overflow: hidden;
        z-index: 1;
        position: sticky;
    }

    li.error:not(.editing) #background { background: rgb(255,150,150); }
    li.selected #background { background: rgb(200,200,200); }
    li.last #background { 
      background: var(--visualscript-primary-color, #65c2fc);
    }

    li:not(.selected):not(.last):not(.error):not(.editing) #itemHeader:hover #background {
        background: rgb(220,220,220);
    }

    li #itemHeader:hover {
      cursor: pointer;
    }

    visualscript-icon {
      padding: 0px 7px;
    }

    @media (prefers-color-scheme: dark) {

      li #itemHeader:hover #background{ background-color: rgb(70, 70, 70) }

      li.error:not(.editing) #background { background: rgb(95,60,60); }
      li.selected #background { background: rgb(80,80,80); }
      li.last #background { background: #0091ea;}

    }

    `;
  }
    
    static get properties() {
      return {
        type: {
          type: String,
          reflect: true,
        },
        key: {
            type: String,
            reflect: true,
        },
        open: {
            type: Boolean,
            reflect: true,
        },
      };
    }

    type: TreeItemProps['type'] = 'value'
    key: TreeItemProps['key']
    li?: HTMLLIElement
    value: TreeItemProps['value'];
    parent: TreeItemProps['parent'];
    open: boolean;
    onClick: TreeItemProps['onClick'];
    tree?: any;

    error?: any;
    editing?: any;


    resolveReady: {
      resolve: Function
      reject: Function
    }

    ready = new Promise((resolve, reject) => {
      this.resolveReady = {
        resolve,
        reject
      }
    })

    constructor(props: TreeItemProps) {
      super();

      this.key = props.key
      this.value = props.value
      this.parent = props.parent
      this.onClick = props.onClick

    //   this.set(props.target)
      if (props.type) this.type = props.type 
    }

    removeClass = (str: 'selected' | 'last'): any => {
        if (this.li) this.li.classList.remove(str)
    }

    updated = ( ) => {
      const input = this.shadowRoot.querySelector('input')
      if (input) input.focus()
    }

    render() {

        const icon = new Icon({type: this.type})
        const leftPad = 8*(this.parent.depth ?? 0)

        // Show Item Info (or edit it...)
        let content;
        if (!this.key) {
          content = html`<input type="text" @change=${(e) => {
            this.key = e.target.value
            this.resolveReady.resolve()
          }}/>
          `
          
        } else content = html`${this.key}`

        this.editing = (this.key) ? false : true
        this.error = (this.value) ? false : true

        const isUsingFilesystemStrings = filesystemStrings.includes(this.type)

        this.tree = (this.open) 
        ? new this.parent.constructor({
          target: this.value, 
          depth: this.parent.depth + 1, 
          conditions: this.parent.conditions, 
          onClick: this.onClick, 
          mode: (isUsingFilesystemStrings) ? 'files': undefined
        }) // Create new tree from parent constructor (to avoid circular dependency)
        : undefined

        return html`
        <li class="${`${this.editing ? 'editing' : ``} ${this.error ? 'error' : ``}`}">
        <div id="itemHeader" @click=${() => {

          if (!this.editing && !this.error) {
            this.li = this.shadowRoot.querySelector('li')


            this.li.classList.add('last')
            this.li.classList.add('selected')

            const remove = () => {
              this.removeClass('last')
              window.removeEventListener('click', remove)
            }

            window.addEventListener('mousedown', remove)
    
            // Switch Icons (if ready)
              if (valueStrings.includes(this.type)){
                if (this.key && this.value){
                  if (this.onClick instanceof Function) this.onClick(this.key, this.value)
                }
              } else {

                // Filesystem-Specific Reaction
                if (this.type === 'folder') this.type = 'openfolder'
                else if (this.type === 'openfolder') this.type = 'folder'

                // Global Toggle
                this.open = !this.open
              }
            }
          }}>
        <div id="background">
        </div>
          <div id="text" style="padding-left: ${leftPad}px">
            ${filesystemStrings.includes(this.type) ? icon : ''}
          <span class="name" style="padding-left: ${filesystemStrings.includes(this.type) ? '0' : '7'}px">
            ${content}
          </span>
         </div>
         </div>
          ${this.tree}
        </li>
      `
    }
  }
  
  customElements.get('visualscript-tree-item') || customElements.define('visualscript-tree-item',  TreeItem);