import { ESComponent } from "../component";
import * as resolve from "./utils/resolve";
import update from "./utils/update";

export function add(id, esm: ESComponent, parent) {

    let elm = create(id, esm, parent);

    if(!esm.element) esm.element = elm;
    if(!esm.default) esm.default = function (props:{[key:string]:any}){ 
        if(typeof props === 'object') 
            for(const key in props) { 
                if(this.element) {
                    if(typeof this.element[key] === 'function' && typeof props[key] !== 'function')
                        { //attempt to execute a function with arguments
                            if(Array.isArray(props[key]))
                            this.element[key](...props[key]);
                            else this.element[key](props[key]);
                        } 
                    else if (key === 'style') { Object.assign(this.element[key],props[key])}
                    else this.element[key] = props[key]; 
                }
            }
            
        return props;
    }

    return esm;
}

export function create(id, esm: ESComponent, parent){

    if(esm.element) {
        if(typeof esm.element === 'string') {
            const elm = document.querySelector(esm.element); //get first element by tag or id 
            if(!elm) {
                const elm = document.getElementById(esm.element); 
                if (elm) esm.element = elm;
            } else esm.element = elm;
        }
    }
    else if (esm.tagName) esm.element = document.createElement(esm.tagName);
    else if(esm.id) {
        const elm = document.getElementById(esm.id); 
        if (elm) esm.element = elm;
    }

    if (!(esm.element instanceof Element)) console.warn('Element not found for', id);
    update(id, esm, parent);
    return esm.element;
}

