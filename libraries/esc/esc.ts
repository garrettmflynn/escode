import { Editor, EditorProps } from "../escode/src"
import Bundle from "../esmpile/src/Bundle"

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

type GeneralElementType = baseESElement | ESElementInfo | ESDefineInfo
export type ESComponent<ElementType = GeneralElementType>  = {
    
    default: Function,
    __compose: ESComponent // Is Merged into this component


    __children: {
        [x:string]: ESComponent // General Components
    }

    __childposition?: number // Will be resolved automatically if not set

    __onconnected: Function
    __ondisconnected: Function

    // HTML-Specific
    __element?: ElementType,
    __parent?: ComponentElement,
    __attributes:{ [x in attributeKeys] : any }
    __onresize: Function,
    __extensions?: {[x:string]: any}
    __source: __source // Grabbed from esmpile
    __path: string, // Path of the Component (ALL HAVE IT)
    __editor?: boolean | EditorProps | typeof Editor // Shorthand for creating the editor
    __connected: Promise<void>  // To resolve when fully loaded

    // Keys to Manage Internal Things
    ____editor: Editor
    __proxy: ProxyConstructor,
    ____connected: Function // Trigger for ready
    // __readyPromises: Promise<void>[]


    

}