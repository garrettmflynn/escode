import Inspectable from "./inspectable"
import Poller from "./Poller"

type onUpdateFunction = (path: string, info: ActiveInfo, ...args: any[]) => void
export type MonitorOptions = {
    pathFormat: 'absolute' | 'relative',
    polling?: PollingOptions,
    keySeparator: '.' | string,
    onInit?: (path: string, info: ActiveInfo) => any | Promise<any>,
    onUpdate?: onUpdateFunction | {
        callback: onUpdateFunction,
        info: {
            performance: boolean
        }
    },
}

export type InspectableOptions = {
    type?: 'function' | 'object', 
    parent?: Inspectable
    name?:string,
    callback?: Inspectable['callback'],
    keySeparator?: '.' | string,
    listeners?: ListenerRegistry
    path?: (arr: ArrayPath) => ArrayPath | ArrayPath,
    depth?: number
}

export type ArrayPath = (string | symbol)[]
export type PathFormat = string | symbol | (string | symbol)[]

export type PollingOptions = {
    force?: boolean,
    sps?: number
}


export type ListenerOptions = {
    static?: boolean
}

export type InternalOptions = {
    poll: boolean,
    seen: any[] // Check for circular references
}

export type Info = {
    performance?: boolean
}

export type ActiveInfo = {
    function?: Function,
    arguments?: any[],
    info?: Info,
    performance?: number
}


export type ListenerInfo = {
    id: string
    last: string,
    infoToOutput: Info,
    callback: (path: string, info:ActiveInfo, output: any[]) => void,
    path: {
        relative: ArrayPath,
        absolute: ArrayPath,
        output: ArrayPath,
        parent: ArrayPath
    }
    sub: symbol,

    current: any,
    parent: any,
    reference: any,
    original: any,
    history: any
}

export type ListenerLookup = {
    [x: symbol]: string
}

export type ListenerPool = {
    [x: string]: {
        [x: symbol]: ListenerInfo
    }
}

export type ListenerRegistry = {
    functions: ListenerPool,
    setters: ListenerPool,
    polling: Poller['listeners'],
}