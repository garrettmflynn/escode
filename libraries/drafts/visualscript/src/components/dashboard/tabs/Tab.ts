
import { LitElement, html, css } from 'lit';
import { Dashboard } from '../Dashboard';
import { TabToggle } from './TabToggle';
import { Control, ControlProps } from '../Control';
import { Panel } from './Panel';

export const tabStyle = css`

:host {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: inherit;
  display: block;
  overflow: hidden;
  position: relative;
}

slot {
  overflow: scroll;
}

:host * {
  box-sizing: border-box;
}

:host([type="dropdown"]) {
  border-radius: 10px;
  box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
  position:absolute; 
  z-index: 3;
  width: auto;
  height: auto;
  padding: 5px;
  color: black;
  font-size: 80%;
  min-width: 200px;
  background: rgba(255,255,255, 0.8);
  backdrop-filter: blur(6px);
}

:host([type="dropdown"]) > div {
  margin:0; 
  padding:0;
  border-radius: 3px;
  user-select: none;
  padding: 5px 10px;
}

:host([type="dropdown"]) > div:hover {
  background: #EEE;
 }

@media (prefers-color-scheme: dark) {
  
  :host([type="dropdown"]) {
    background: rgba(100,100,100, 0.8);
    color: white;
  }

  :host([type="dropdown"]) > div:hover {
    background: #AAA;
   }
}

`

export type TabProps = {
  name?: string;
  controls?: ControlProps[],
  type?: 'app' | 'tab' | 'dropdown',
  close?: boolean,
  on?: (target:TabToggle)=> any,
  off?: (target:TabToggle)=> any,
}


export const TabPropsLit = {
  name : {
    type: String,
    reflect: true
  },
  controls: {
    type: Array,
    reflect: true
  },
  on: {
    type: Function,
    reflect: true
  },
  close: {
    type: Boolean,
    reflect: true
  },
  type: {
    type: String,
    reflect: true
  },
  off: {
    type: Function,
    reflect: true
  }
}

export class Tab extends LitElement {

  name: TabProps['name']
  controls: TabProps['controls'] = []
  close: TabProps['close']

  on: TabProps['on'] = () => {}
  off: TabProps['off'] = () => {}
  type: TabProps['type'] = 'tab'

  controlPanel: HTMLDivElement
  dashboard: Dashboard;
  toggle: TabToggle

  static get styles() {
    return tabStyle;
  }
    
    static get properties() {
      return TabPropsLit;
    }


    constructor(props: TabProps = {}) {
      super();
      if (props.name) this.name = props.name
      if (props.controls) this.controls = props.controls // Will also check for controls in the <slot> later
      if (props.close) this.close = props.close
      if (props.type) this.type = props.type

      if (props.on) this.on = props.on
      if (props.off) this.off = props.off

      // Allow dashboards inside apps!
      let dashboards = document.body.querySelectorAll('visualscript-dashboard')
      this.dashboard = (Array.from(dashboards).find(o => o.parentNode === document.body) as Dashboard) ?? new Dashboard() // Find global dashboard
      this.dashboard.global = true
      this.dashboard.open = false


      // Create a toggle
      this.toggle = new TabToggle({
        tab: this,
        close: this.close
      })

      this.dashboard.addEventListener('close', (ev) => {
        this.off(this.toggle)
      })

    }

    willUpdate(changedProps:any) {
      if (changedProps.has('controls')) {
        this.controlPanel = document.createElement('div')
        this.controls.forEach(o => {
          this.addControl(new Control(o))
        })
      }

      if (changedProps.has('close')) {
        this.toggle.close = this.close // Pass to toggle
      }
    
    }

    addControl = (instance: Control) => {
      this.controlPanel.appendChild(instance)
    }

    delete = (fromParent=false) => {
      if (!fromParent && (this.parentNode as any)?.removeTab instanceof Function) (this.parentNode as Panel).removeTab(this)
      this.remove()
      this.toggle.remove()
    }

    updated = () => {
      const controls = this.querySelectorAll('visualscript-control')
      controls.forEach((control: Control) => {
        if (this.type === 'app')  control.park = true // Park all controls within an app
        else if (!control.park) this.addControl(control)
      })
    }
    
    render() {
      return html`
      <slot></slot>
    `
    }
  }
  
  customElements.get('visualscript-tab') || customElements.define('visualscript-tab',  Tab);