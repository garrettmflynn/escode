export type MonitorOptions = {
    pathFormat: 'absolute' | 'relative',
    polling?: PollingOptions,
    keySeparator: '.' | string
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
    args?: any[],
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