// Note: Merge at the SAME LEVEL as the preprocessing and connect objects (to avoid enforcing with a specific name)
import * as filter from "../../../filter/index.esc.js"

export const esDOM = {
    filter
}

export const esListeners = {
    'filter.settings.sps': 'connect.sps',

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
//     esDOM: {
//         devices: filter
//     }
// }

// export const esCompose = [filterOverride, signal]

// export const esDOM = {
//     devices: {
//         esDOM: {
//             filter: {
//                 settings: {
//                     // useBandpass: true,
//                     // useDCBlock: true,
//                 },
//             }
//         }
//     },
// }