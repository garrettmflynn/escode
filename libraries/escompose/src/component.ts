
type ComponentElement = Element & { [x:string]: any }

type attributeKeys = keyof HTMLElement['attributes']

type baseESElement = string | ComponentElement

export type ESElementInfo = {
    element?: baseESElement,
    id?: string,
    selectors?: string,
    style?: {[key:string]:any},
    attributes?: {
        [x in attributeKeys] : any
    },
    parentNode?: baseESElement
}


export type ESComponent = {
    
    default: Function,
    esCompose: ESComponent // Is Merged into this component

    esComponents: {
        [x:string]: ESComponent
    }

    esInit: Function
    esDelete: Function

    // HTML-Specific
    id: string;
    esElement?: baseESElement | ESElementInfo,
    esParent?: ComponentElement,
    esStyle: {[key:string]:any},
    esAttributes:{ [x in attributeKeys] : any }
    esOnResize: Function,
    esOnRender: Function
    esOnRemove: Function


    __isESComponent: boolean,
    __esProxy: ProxyConstructor,

}