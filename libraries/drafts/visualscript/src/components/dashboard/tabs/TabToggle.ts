
import { LitElement, html, css } from 'lit';
import { Tab } from './Tab';
import { Sidebar } from '..';
import { TabBar } from './TabBar';

export type TabToggleProps = {
  tab: Tab,
  selected?: boolean,
  grow?: boolean,
  close?: boolean
}


export const TabTogglePropsList = {
  // name : {
  //   type: String,
  //   reflect: true
  // },
  selected: {
    type: Boolean,
    reflect: true
  },
  grow: {
    type: Boolean,
    reflect: true
  },
  close: {
    type: Boolean,
    reflect: true
  }
}

export class TabToggle extends LitElement {

  to: Tab
  selected: TabToggleProps['selected']
  close: TabToggleProps['close']

  static get styles() {
    return css`

    :host {
      user-select: none;
      position: relative;
    }

    :host([grow]) {
      flex-grow: 1;
    }

    :host * {
      box-sizing: border-box;
    }

    button {
        color: black;
        background: rgb(205,205,205);
        border-right: 1px solid rgb(230,230,230);
        border: 0px;
        padding: 6px 20px;
        text-align: center;
        font-size: 80%;
        cursor: pointer;
        width: 100%;
        height: 100%;
    }

    button > span {
      font-size: 60%;
    }

    button:hover {
        background: rgb(230,230,230);
      }
  
      button:active {
        background: rgb(210,210,210);
      }
  
      :host([selected]) button {
        background: rgb(230,230,230);
      }

      #close {
        position: absolute;
        top: 50%;
        right: 5px;
        width: 15px;
        height: 15px;
        transform: translateY(-50%);
      }

      @media (prefers-color-scheme: dark) {
        button {
            color: white;
            background: rgb(50,50,50);
            border-right: 1px solid rgb(25,25,25);
        }

        button:hover {
            background: rgb(60,60,60);
        }
      
        button:active {
        background: rgb(75,75,75);
        }
      
        :host([selected]) button {
          background: rgb(60,60,60);
        }

      }
    `;
  }
    
    static get properties() {
      return TabTogglePropsList;
    }

    grow: TabToggleProps['grow'] = false
    bar: TabBar

    constructor(props: TabToggleProps) {
      super();
        this.to = props.tab
        if (props.grow) this.grow = props.grow
        if (props.close) this.close = props.close
        if (props.selected) this.selected = props.selected
    }

    select = (toggles?) => {

      if (this.to.on instanceof Function) this.to.on(this)

        // Show Correct Tab
        if (!toggles){
           toggles = this.getBar().querySelectorAll('visualscript-tab-toggle') // Get toggles
           if (toggles.length === 0) toggles = this.getBar().shadowRoot.querySelectorAll('visualscript-tab-toggle')
        }
       

        if (toggles?.length){

          this.selected = true

          // if (this.to.style.display === 'none') {
            toggles.forEach(t => {

              if (t != this) { 
                t.selected = false
                t.to.style.display = 'none' 
                t.to.off(this)
              } else { t.to.style.display = ''} // hide other tabs

            })
          // }
        }

        // Swap Sidebar Content
        const dashboard = this.to.dashboard 

        if (dashboard){
          const sidebar = dashboard.querySelector('visualscript-sidebar') as Sidebar
          
          if (sidebar) {
            sidebar.content = (this.to.controlPanel.children.length) ? this.to.controlPanel : ''
          }
        }
    }

    getBar = () => {
      let parent = this.parentNode as TabBar | any
      this.bar = ((!(parent instanceof HTMLElement)) ? parent.host : parent) as TabBar
      return this.bar
    }

    updated = () => {
      this.bar = this.getBar()
    }
    
    render() {

      return html`
      <button @click=${() => {
        if (this.parentNode) this.select() // Only allow if in the DOM
      }}>
        ${this.to.name ?? `Tab`}
        ${(this.close === true) ? html`<visualscript-icon id=close type=close @click=${() => this.getBar().delete(this.to.name)}></visualscript-icon>` : ''}
      </button>
    `
    }
  }
  
  customElements.get('visualscript-tab-toggle') || customElements.define('visualscript-tab-toggle',  TabToggle);