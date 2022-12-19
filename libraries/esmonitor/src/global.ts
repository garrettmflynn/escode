import { Info } from "./types";

type GlobalESMonitorState = {
    state: {[x:string]: {output: any, value: any}},
    callback?: Function | undefined,
    info: Info
}

declare global {
    interface Window { ESMonitorState: GlobalESMonitorState; }
}

// ------------- Global Inspectable (monitored for all changes) -------------
globalThis.ESMonitorState = {
    state: {},
    callback: undefined,
    info: {}
} as GlobalESMonitorState


export default globalThis.ESMonitorState