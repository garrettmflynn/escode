import { isNode } from "../../utils";

export let __props = undefined //properties on the '__props' object will be proxied and mutatable as 'this' on the node. E.g. for representing HTML elements

export let __onconnected = function (node) { 
    this.innerHTML = 'Test';
    this.style.backgroundColor = 'green'; 
    document.body.appendChild(this.__props); 
}

export const __ondisconnected = function(node) {
    document.body.removeChild(this.__props);
}


if (!isNode) __props = document.createElement('div')