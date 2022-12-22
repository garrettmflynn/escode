import * as sketchOne from './sketches/one.esc.js'
import * as sketchTwo from './sketches/two.esc.js'

import * as global from './sketches/global.js'


// <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">

const prefix = 'visualscript'
export const __editor = {
    views: {
        menubar: false,
    },
    style: {
        [`--${prefix}-primary-color`]: '#ed225d',
        [`--${prefix}-secondary-color`]: '#d9d9d9',
        [`--${prefix}-secondary-font-color`]: '#333',
        [`--${prefix}-font-family`]: 'Montserrat, sans-serif'
    }
}

export const __attributes = {
    style: {
        display: 'flex'
    }
}

export const __compose = [global.fillParent]

// // TODO: Have to fix source resolution
// export const firstSketch  = {
//     __compose: {
//         ref: sketchOne,
//         src: './sketches/one.esc.ts'
//     },
// }

export const firstSketch = sketchOne

// Second Sketch
export const secondSketch = sketchTwo
