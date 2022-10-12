export type MonitorOptions = {
    pathFormat?: 'absolute' | 'relative',
    polling?: PollingOptions
}

export type PollingOptions = {
    force?: boolean,
    sps?: number
}

export type InternalOptions = {
    poll?: boolean,
}

export type ListenerInfo = {
    id: string
    last: string,

    callback: Function,
    path: {
        relative: string,
        absolute: string,
        output: string,
        parent: string
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