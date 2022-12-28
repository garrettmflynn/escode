// Note: Merge at the SAME LEVEL as the preprocessing and connect objects (to avoid enforcing with a specific name)
import * as noiseComponent from "./generator.esc.js"

export const noise = noiseComponent

// Remove listeners so that noise is the only one triggering output
export const __listeners = {
    noise: {
        preprocess: true
    },

    output: {
        preprocess: false,
        ondata: false,
        noise: true,
    }
}