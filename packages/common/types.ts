import { Editor, EditorProps } from "../escompose";
import * as esm from "../esmpile/src";

import Monitor from "../esmonitor/src";
import { MonitorOptions } from "../esmonitor/src/types";
import { Loaders } from "../core/types";


export type Options = {
    keySeparator: MonitorOptions['keySeparator'],
    monitor: Monitor | Partial<MonitorOptions>
    listeners?: {
        static?: boolean
    },

    loaders: Loaders

    relativeTo: string,

    listen?: boolean,
    clone?: boolean,

    // TODO: Make these the same...
    synchronous?: boolean, // TODO: Test if this really works...
    await?: boolean, // Return a promise that resolves after the entire app is ready

    // nested: {
    //     parent: any,
    //     name: any,
    // }, // Add ES Component types here

    utilities: {
        code?: {
            class: typeof Editor,
            options: EditorProps
        },
        bundle?: {
            function: typeof esm.bundle.get,
            options: any
        }
        compile?: {
            function: typeof esm.compile,
            options: any
        }
    }
}