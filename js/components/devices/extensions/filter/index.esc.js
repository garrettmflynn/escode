// Note: Merge at the SAME LEVEL as the preprocessing and connect objects (to avoid enforcing with a specific name)
import * as filterComponent from "../../../filter/index.esc.js"

export const filter = filterComponent

export const __listeners = {
    'filter.settings.sps': {
        'connect.sps': true
    },

    filter: {
        preprocess: true
    },

    output: {
        filter: true,
        preprocess: false,
        ondata: false,
        noise: false,
    }
}


// // USAGE WHEN NESTED
// const filterOverride = {
//         devices: filter
// }

// export const __compose = [filterOverride, signal]

//    export const devices = {
//             filter: {
//                 settings: {
//                     // useBandpass: true,
//                     // useDCBlock: true,
//                 },
//             }
//     },
