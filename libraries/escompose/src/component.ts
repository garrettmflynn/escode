import Component from "./index";

type ComponentElement = Element & { component?: Component }

export type ESComponent = {
    
    
    default: Function,
    
    
    // HTML-Specific
    id: string;
    tagName: string;
    element?: string | ComponentElement,
    parentNode?: Element,
    style: {[key:string]:any},
    attributes: {

    }
    onresize: Function,
    onrender: Function
    onremove: Function

}