// Note: Merge at the SAME LEVEL as the preprocessing and connect objects (to avoid enforcing with a specific name)
import * as noise from "./generator.esc.js"

// Add noise to hierarchy
export const esDOM = {
    noise
}

// Remove listeners so that noise is the only one triggering output
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

// // USAGE WHEN NESTED
// const power = [50, 60]
// const movement = [1]

// const noiseOverride =  {
//     esDOM: {
//         devices: noise
//     }
// }

// export const esDOM =  {
//     devices:{
//         esDOM: {
//             noise: {
//                 frequencies: [[...movement, ...power]] // setting custom frequencies
//             }
//         }
//     }
// }

// export const esCompose = [noiseOverride, signal]