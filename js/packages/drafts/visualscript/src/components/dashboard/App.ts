
import { html, css } from 'lit';
import { Tab, TabProps, TabPropsLit, tabStyle } from './tabs/Tab';
import { slotGrid } from './Dashboard';

// ---------------- SPECIFICATION ----------------
// 1. Display the application metadata
// 2. Click into and instantiate the application
// 3. Leave the application

export type AppProps = TabProps & {
  // name?: string;
}

export class App extends Tab {

  name: AppProps['name'];
  // type: AppProps['type'] = 'app';
  parent: Node;


  static get styles() {
    return css`
    :host {
      color-scheme: light dark;
      max-width: 100vw;
      max-height: 100vh;
    }


    slot {
      overflow: hidden !important;
    }

    ${tabStyle}
    ${slotGrid}
    `

  }
  
    static get properties() {
      return Object.assign({

      }, TabPropsLit);
    }


    constructor(props: AppProps = {}) {
      const tabProps = (Object.assign({
        on: (target) => {
          this.dashboard.main.appendChild(this)
          if (props.on instanceof Function) props.on(target)
        },
        off: (target) => {
          this.style.display = ''
          this.parent.appendChild(this) // Replace App element
          if (props.off instanceof Function) props.off(target)
        }
      }, props) as AppProps)
      tabProps.name = props.name
      super(tabProps);

      this.name = props.name
      this.type = 'app'
      this.parent = this.parentNode // Grab original parent
    }



    render() {

      if (!parent) this.parent = this.parentNode // Grab original parent

      return html`
        <slot></slot>
      `
    }
  }
  
  customElements.get('visualscript-app') || customElements.define('visualscript-app',  App);