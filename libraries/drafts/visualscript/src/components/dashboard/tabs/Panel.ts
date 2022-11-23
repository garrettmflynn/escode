
import { LitElement, html, css } from 'lit';
import { Tab } from './Tab';
import './TabToggle';
import { TabBar } from './TabBar';
import { lighterDarkBackgroundColor } from 'src/globals';

export type PanelProps = {
  minTabs?: number,
  tabs?: Tab[]
}

export class Panel extends LitElement {

  static get styles() {
    return css`

    :host {
      box-sizing: border-box;
      grid-area: main;
      overflow: hidden;
      background: white;
      color: black;
      position: relative;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-areas:
          "tabs"
          "content";
      grid-template-rows: min-content 1fr;
    }

    :host * {
      box-sizing: border-box;
    }

    #notabs {
      width: 100%;
      height: 100%;
      display: flex; 
      align-items: center;
      justify-content: center;
      font-size: 80%;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        color: white;
        background-color: ${lighterDarkBackgroundColor};
      }
    }
    `;
  }
    
    static get properties() {
      return {
        tabLabels: {
          type: Object,
          reflect: true
        },
        tabs: {
          type: Object,
          // reflect: true
        }
      };
    }


    minTabs: PanelProps['minTabs'] = 0
    tabs: Map<string, Tab> = new Map()
    tabLabels: string[]
    activeTab: number
    bar = new TabBar()

    constructor(props: PanelProps = {}) {
      super();
      if (props.minTabs) this.minTabs = props.minTabs

      this.reset()
      if (props.tabs) {
        props.tabs.forEach(t => this.addTab(t, false, false))
        this.updateTabs()
      }
    }

    reset = () => {
      const selectedActiveTab = false
      this.tabs.forEach(t => this.removeTab(t)) // remove existing
      if (!selectedActiveTab) this.activeTab = 0
      this.updateTabs()
    }

    addTab = (tab, switchTo=false, update=true) => {
      this.insertAdjacentElement('beforeend', tab)
      if (switchTo) this.activeTab = this.tabs.size
      this.tabs.set(tab.name, tab)
      if (update) this.updateTabs()
    }

    removeTab = (tab: Tab | string) => {
      if (tab instanceof Tab) tab = tab.name
      const tabObj = this.tabs.get(tab)
      tabObj.delete(true)
      this.updateTabs()
      this.tabs.delete(tab)
    }

    updateTabs = () => {
      this.tabLabels = Array.from(this.tabs.values()).map(t => t.name)
    }
    
 
    getTabs = () => {
      this.tabs = new Map()

      // Tabs
      for(var i=0; i<this.children.length; i++){        
        const child = this.children[i] as Tab
        if (child instanceof Tab) this.tabs.set(child.name, child)
      }
      
      this.updateTabs()

      return Array.from(this.tabs.values())
    }
    
    render() {
      const tabs = this.getTabs()

      const toggles = tabs.map((t,i) => {
        if (i !== this.activeTab) t.style.display = 'none' // Hide tabs other than the first
        return t.toggle
      })

      const selectedToggle = toggles[this.activeTab]
      if (selectedToggle) selectedToggle.select(toggles)
      this.bar.tabs = tabs // Set tabs

      toggles.forEach(t => t.grow = true)
      this.bar.style.height = (toggles.length < this.minTabs) ? '0px' : ''

      return html`
      ${this.bar}
      <slot><div id="notabs">No Tabs Open</div></slot>
    `
    }
  }
  
  customElements.get('visualscript-panel') || customElements.define('visualscript-panel',  Panel);