import { Editor, EditorProps } from "../../escode/src"
import Bundle from "../../esmpile/src/Bundle"

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

export type esSource = string | (string | Bundle)[]

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

    esChildPosition?: number // Will be resolved automatically if not set

    esConnected: Function
    esReady: Promise<void>
    __esReady: Function // Trigger for ready
    __esReadyPromises: Promise<void>[]
    esDisconnected: Function

    // HTML-Specific
    id: string;
    esElement?: ElementType,
    esParent?: ComponentElement,
    esAttributes:{ [x in attributeKeys] : any }
    esOnResize: Function,
    esOnRender: Function
    esOnRemove: Function

    esExtensions?: {[x:string]: any}

    // Shorthand for creating the editor
    esCode?: boolean | EditorProps | typeof Editor
    __esCode: Editor


    esSource: esSource // Also set in esmpile


    __isESComponent: string, // Path of the Component
    __esProxy: ProxyConstructor,
    

}