import * as sketchOne from './sketches/one.esc.js'
import * as sketchTwo from './sketches/two.esc.js'

import * as global from './sketches/global.js'


// <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">

const prefix = 'visualscript'
export const __editor = {
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
export const __children = {

    // First Sketch
    // [`Sketch 1`]: sketchOne,
    [`Sketch 1`]: {
        __compose: {
            __object: sketchOne,
            __src: './sketches/one.esc.ts'
        },
    }, 

    // [`Sketch 1`]: {
    //     __compose: {
    //         __object: sketchOne,
    //         __src: './sketches/one.esc.ts'
    //     },
    // }, 
    
    // Second Sketch
    [`Sketch 2`]: sketchTwo
    // [`Sketch 2`]: {
    //     __compose: {
    //         __object: sketchTwo,
    //         __src: './sketches/two.esc.ts'
    //     }
    // }
}


export const __listeners = {

}