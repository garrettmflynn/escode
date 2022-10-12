import { ActiveInfo, MonitorOptions } from "../esmonitor/src/types";


type onUpdateFunction = (path: string, info: ActiveInfo, ...args: any[]) => void
export type Options = MonitorOptions & {
    onInit?: (path: string, info: ActiveInfo) => void,
    onUpdate?: onUpdateFunction | {
        callback: onUpdateFunction,
        info: {
            performance: boolean
        }
    },
}