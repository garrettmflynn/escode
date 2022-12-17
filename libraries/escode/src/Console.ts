
import { LitElement, html, css } from 'lit';


export type ConsoleProps = {

}

export class Console extends LitElement {

  static get styles() {
    return css`

    :host { 
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;
      font-family: var(--visualscript-font-family, sans-serif);
    }

    :host > h2 {
      font-size: 12px;
      margin: 0;
      padding: 5px 10px;
      background: #333;
      color: white;
      width: 100%;
      cursor: pointer;
    }
    
    :host > ul {
      overflow: scroll;
      height: 200px;
      list-style-type: none;
      padding: 0;
      margin: 0;
      font-size: 80%;
      transition: height 0.5s;
    }

    :host li {
      padding: 5px 10px;
      color: rgb(50,50,50);
      border: 1px solid rgba(220,220,220);
    }

    :host li.error {
      background: rgba(255,0,0,0.1);
      color: rgba(255,0,0,0.8);
    }

    :host li.warn {
      background: rgba(255,255,0,0.2);
      color: #996515;
    }

    :host(.collapsed) > ul {
      height: 0px;
    }


    `;
  }
    
    static get properties() {
      return {

      };
    }

    originals = {}

    header = document.createElement('h2');
    list = document.createElement('ul');

    constructor(props:ConsoleProps={}) {
      super();

      this.header.innerText = 'Console';

      // Track console open/close state
      const collapsed = localStorage.getItem('escode-console.collapsed') === 'true';

      this.header.onclick = () => {
        this.classList.toggle('collapsed');
        localStorage.setItem('escode-console.collapsed', `${this.classList.contains('collapsed')}`);
      }

      if (collapsed) this.classList.add('collapsed')

      const listen = (command: 'log' | 'warn' | 'error') => {
        this.originals[command] = console[command]

        const classThis = this
        console[command] = function (...args) {
          classThis.originals[command].call(this, ...args)
          classThis[command](...args)
        }
      }

      const commands = ['log', 'warn', 'error']
      commands.forEach(listen)
    }

    #log = (cls, ...args) => {
      const message = document.createElement('li')
      message.classList.add(cls)
      const text = args.map(o => {
        try { 
          if (typeof o === 'object') return JSON.stringify(o)
          else return o.toString() 
        } catch { return o }
      }).join(' ')

      message.innerText = text

      // this.originals['log'](args)

      this.list.appendChild(message)
    }

    log = (...args) => this.#log('log', ...args)

    warn = (...args) => this.#log('warn', ...args)

    error = (...args) => this.#log('error', ...args)

    render() {
      
      return html`${this.header}${this.list}`

    }
  }
  
  customElements.define('escode-console', Console);