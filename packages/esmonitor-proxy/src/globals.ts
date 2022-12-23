import { isProxy as isProxyFromMonitor } from '../../esmonitor/src/globals'



export const isProxy = isProxyFromMonitor

export const fromInspectable = Symbol("fromInspectable")

export const fromInspectableHandler = Symbol("fromInspectableHandler")
