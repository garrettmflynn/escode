import { isProxy as isProxyFromMonitor } from '../../../src/globals'

export const isProxy = isProxyFromMonitor

export const fromInspectable = Symbol("fromInspectable")

export const fromInspectableHandler = Symbol("fromInspectableHandler")
