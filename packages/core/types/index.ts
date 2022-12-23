import { Options } from "../../common/types"
import { ESComponent } from "../../../spec"

export type AnyClass = { new (...args: any): any }
export type FinalConfig = { [key: string]: any }
export type ConfigObject = NodeList | string | Function | AnyClass | Element | FinalConfig

export type ConfigInput = ConfigObject | ConfigObject[]

export type ApplyOptions = {
    toApply: any, 

    parent?, // Component parent
    parentObject?, // Object parent

    opts: Partial<Options>, 
    callbacks: {
        [key: string]: (...args: any) => void
    }, 
    name?: string | symbol,
    waitForChildren: boolean
}

export type LoaderFunction = (o: ESComponent, toApply: any, options: Partial<Options>) => any


export type LoaderBehaviorType = 'load' | 'activate' | 'start' | 'stop'
export type LoaderObject = {
    name?: string,
    required?: boolean,
    behavior?: LoaderBehaviorType,
    default: LoaderFunction,
    properties: {
        dependencies?: string[]
        dependents?: string[]
    },
}

export type Loader = LoaderFunction | LoaderObject

export type Loaders = Loader[]


export type SortedLoaders = {
    load?: Loaders,
    activate?: Loaders,
    start?: Loaders,
    stop?: Loaders,
}