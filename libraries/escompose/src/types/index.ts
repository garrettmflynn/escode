import { Options } from "../../../common/types"
import { ESComponent } from "../../../esc/esc"

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

export type Loader = LoaderFunction | {
    name?: string,
    default: LoaderFunction,
    properties: {
        dependencies?: string[]
        dependents?: string[]
    }
}

export type Loaders = Loader[]