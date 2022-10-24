
type ComponentElement = Element & { [x:string]: any }

type attributeKeys = keyof HTMLElement['attributes']

type baseESElement = string | ComponentElement

export type ESElementInfo = {
    // Get Element
    id?: string,
    selectors?: string,
}

export type ESDefineInfo = {
    name: string,
    extends: string
}

export type ESElementArray = [ESDefineInfo['name'], {extends: ESDefineInfo['extends']}]

type GeneralElementType = baseESElement | ESElementInfo
export type ESComponent<ElementType = GeneralElementType>  = {
    
    default: Function,
    esCompose: ESComponent // Is Merged into this component

    esComponents?: {
        [x:string]: ESComponent<ESDefineInfo> // Component Definitions
    }

    esDOM: {
        [x:string]: ESComponent // General Components
    }

    esInit: Function
    esDelete: Function

    // HTML-Specific
    id: string;
    esElement?: ElementType,
    esParent?: ComponentElement,
    esStyle: {[key:string]:any},
    esAttributes:{ [x in attributeKeys] : any }
    esOnResize: Function,
    esOnRender: Function
    esOnRemove: Function


    __isESComponent: boolean,
    __esProxy: ProxyConstructor,

}