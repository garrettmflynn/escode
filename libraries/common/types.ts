import Monitor from "../esmonitor/src";
import { MonitorOptions } from "../esmonitor/src/types";


export type Options = {
    keySeparator: MonitorOptions['keySeparator'],
    monitor: Monitor | Partial<MonitorOptions>
    listeners?: {
        static?: boolean
    },
    nested: {
        parent: any,
        name: any,
    }// Add ES Component types here
}