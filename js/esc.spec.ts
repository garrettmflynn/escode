import Edgelord from "../js/packages/core/escode-listeners-loader/edgelord/index"
import { Editor, EditorProps } from "../js/packages/escode-ide/src"
import Bundle from "esmpile"

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

export type __source = string | (string | Bundle)[]

export type GeneralElementType = baseESElement | ESElementInfo | ESDefineInfo

export type ESComponent<ElementType = GeneralElementType>  = {

    __: any // Too Complicated of a classs
    
    default: Function,
    __compose: ESComponent | ESComponent[] // Is Merged into this component

    __listeners: Edgelord
    __parent?: ComponentElement,

    __onconnected: Function
    __ondisconnected: Function

    // HTML-Specific
    __element?: ElementType,
    __childposition?: number // Will be resolved automatically if not set
    __attributes:{ [x in attributeKeys] : any }
    __onresize: Function,
    __extensions?: {[x:string]: any}
    __source: __source // Grabbed from esmpile
    __path: string, // Path of the Component (ALL HAVE IT)
    __editor?: boolean | EditorProps | typeof Editor // Shorthand for creating the editor

    // Keys to Manage Internal Things
    __proxy: ProxyConstructor,
    
    [x:string]: any | ESComponent // General components and properties

}

export default ESComponent