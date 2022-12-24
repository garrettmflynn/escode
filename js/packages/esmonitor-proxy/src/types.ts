import Inspectable from "./index"
import { 
    ArrayPath as MonitorArrayPath, 
    ListenerRegistry as MonitorListenerRegistry, 
    MonitorOptions 
} from "../../esmonitor/src/types"

export type ArrayPath = MonitorArrayPath
export type ListenerRegistry = MonitorListenerRegistry

export type InspectableOptions = {
    type?: 'function' | 'object', 
    parent?: Inspectable
    name?:string,
    callback?: Function,
    keySeparator: MonitorOptions['keySeparator'],
    pathFormat: MonitorOptions['pathFormat'], // TODO: turn to not a requirement
    listeners?: ListenerRegistry
    path?: (arr: ArrayPath) => ArrayPath | ArrayPath,
    depth?: number,
    globalCallback?: Function
}