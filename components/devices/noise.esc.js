// Note: Merge at the SAME LEVEL as the preprocessing and connect objects (to avoid enforcing with a specific name)
import * as noise from "./noiseGenerator.esc.js"

export const esDOM = {
    noise
}

export const esListeners = {
    noise: {
        preprocess: true
    },

    output: {
        preprocess: false,
        ondata: false,
        noise: true,
    }
}