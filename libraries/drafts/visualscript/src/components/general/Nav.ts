// Note: Inspired by the Red Hat website https://www.redhat.com/en


// ---------------- EXAMPLE ---------------- 
// <visualscript-nav 
// primary='{"menu": [
//   {"content": "Products"},
//   {"content": "Solutions"},
//   {"content": "Services"},
//   {"content": "Resources"},
//   {"content": "Ethos"}

// ],
// "options": [
//   {"content": "Contact"},
//   {"content": "Login"}
// ]}'

// secondary = '[{"content":"Platform","link":"https://app.brainsatplay.com","external":true},{"content":"Studio","link":"https://app.brainsatplay.com/#studio","external":true},{"content":"Developers","link":"https://docs.brainsatplay.com","external":true},{"content":"Community","link":"https://discord.gg/tQ8P79tw8j","external":true},{"content":"Contribute","type":"button","link":"https://github.com/brainsatplay","external":true}]'

// brand='{"content": "Brains@Play", "link": "https://brainsatplay.com", "external": true}'
// ></visualscript-nav>


import { LitElement, html, css } from 'lit';
import { Button } from './Button';

type ElementType = {
  content: string
  link?: string,
  external?: boolean,
  type?: string,
  id?: string,
  onClick?: () => {} 
}

export type NavProps = {
  primary: {
    menu: ElementType[]
    options: ElementType[]
  }
  secondary: ElementType[];
  brand: Partial<ElementType>; // URL or string
  color?: string;
}

export class Nav extends LitElement {

  static get styles() {
    return css`

    
    :host {
      font-family: var(--visualscript-font-family, sans-serif);

      z-index: 2;
      border-bottom: 1px solid rgb(180,180,180);
      background: white;
      color: black;
      display:flex;
      align-items: center;
      width: 100%;
      grid-area: nav;
      z-index: 100;
      overflow: hidden;
    }

    header {
      width: 100%;
    }

    :host * {
      box-sizing: border-box;
    }
    
    h1 {
      margin: 0;
    }

    nav {
      width: 100%;
      padding:  25px;
      display: flex;
      align-items: center;
    }

    #primary {
      position: sticky; 
      top: 0;
      left: 0;
      max-height: 100px;
      justify-content: space-between;
      font-size: 80%;
    }

    #primary > * > * {
      flex-grow: 1;
      display: flex;
    }

    #primary > * {
      height: 100%;
    }

    #primary > div:lastchild {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row-reverse;
    }

    #menu, #options {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    #secondary {
      height: 50px;
      justify-content: flex-end;
      border-bottom: 1px solid #3d3d3d;
      font-size: 75%;
    }

    a{
      color: black;
      text-decoration: none;
    }

    .brand {
      height: 100%;
      padding-right: 15px;
      display: flex;
      align-items: center;
    }

    a:not(.brand) {
      height: 100%;
      display: flex;
      align-items: center; 
      justify-content: center;
      text-align: center;
    }

    .decorate {
      padding: 10px 15px;
    }

    #primary .decorate:hover {
      box-shadow: 0 4px 0 #0fb3ff inset;
    }

    #secondary .decorate:hover {
      box-shadow: 0 3px 0 #c4c4c4 inset;
    }
    
    nav button:last-child {
      margin-right: 0px;
    }

    @media only screen and (max-width: 800px) {
      #primary #menu {
        display: none;
      }
    }

    @media (prefers-color-scheme: dark) {
      :host {
        background: #060606;
        color: white;
      }

      a {
        color: white;
      }
    }

    `;
  }
    
    static get properties() {
      return {
        primary: {
          type: Object,
          // reflect: true,
        },
        secondary: {
          type: Array,
          reflect: true,
        },
        brand: {
          type: Object,
        },
        color: {
          type: String,
          reflect: true,
        },
      };
    }

    primary: NavProps['primary']
    secondary: NavProps['secondary']

    color: NavProps['color']
    brand: NavProps['brand']

    constructor(props: NavProps = {brand: {}, primary: {menu: [], options: []}, secondary: []}) {
      super();


      this.primary = props.primary ?? {menu: [], options: []}
      this.secondary = props.secondary ?? []
      this.color = props.color ?? 'blue'
      this.brand = props.brand ?? {content: 'My Brand'}
    }
    
    willUpdate(changedProps:any) {

    }

    stringToFunction = (value) => {
      let regex = new RegExp('(|[a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\))\s*=>')
      let func = (typeof value === 'string') ? value.substring(0, 8) == 'function' : false
      let arrow = (typeof value === 'string') ? regex.test(value) : false
      return (func || arrow) ? (0, eval)('(' + value + ')') : value;
    }

    getElement = (o: ElementType) => {
      if (o.onClick) o.onClick = this.stringToFunction(o.onClick) // Convert to function

      switch (o.type){
        case 'button': 
          const button = document.createElement('visualscript-button') as Button
          button.id = o.id
          button.size = 'small'
          button.onClick = o.onClick ?? (() => {})
          button.innerHTML = o.content
          return button

        default:
          return html`<a href="${o.link}" id=${o.id}  target=${(o.external) ? "_blank" : "_self"} class="decorate">${o.content}</a>`

      }
    }
  
    render() {

      return html`
      <header>
      ${(this.secondary.length > 0) ? html`<nav id="secondary">${this.secondary?.map(o => this.getElement(o))}</nav>` : ``}
      <nav id="primary">
      ${ html`<div><a class="brand" target=${(this.brand.external) ? "_blank" : "_self"} href=${this.brand.link}>${(this.brand.content) ? ( (/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/.test(this.brand.content)) ? html`<img src="${this.brand.content}"></img>` : html`<h1>${this.brand.content}</h1><slot></slot>` ) : html`<h1><slot></slot></h1>`}</a></div>`}
        <div>
          <div id="options">
          ${this.primary.options?.map(o => this.getElement(o))}
          </div>
          <div id="menu">
            ${this.primary.menu?.map(o => this.getElement(o))}
          </div>
        </div>

      </nav>
      </header>
    `
    }
  }
  
  customElements.get('visualscript-nav') || customElements.define('visualscript-nav',  Nav);