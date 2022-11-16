import * as sketch from '../components/sketch.esc.js'

// Shapes
import * as rectangle from '../components/rectangle.esc.js'
import * as triangle from '../components/triangle.esc.js'
import * as square from '../components/square.esc.js'

import * as global from './global.js'

export const background = 100

export const __compose = [global.fillParent, sketch]

export const __children = {
    rectangle,
    triangle,
    square: {
        x: 200,
        y: 200,
        __compose: square,
    }
}
