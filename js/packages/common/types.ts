import { Editor, EditorProps } from "../../packages/escode-ide/src/index";
import * as esm from "esmpile";

import { Loaders } from "../core/types";


export type Options = {
        
    loaders: Loaders    
    clone?: boolean,
    
    // For Bundle
    relativeTo: string,

    utilities: {
        code?: {
            class: typeof Editor,
            options: EditorProps
        },
        bundle?: {
            function: typeof esm.bundle.get,
            options?: any
        }
        compile?: {
            function: typeof esm.compile,
            options: any
        }
    }
}