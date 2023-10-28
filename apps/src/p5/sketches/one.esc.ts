import * as sketch from '../components/sketch.esc.js'

// Shapes
import * as rectangleComponent from '../components/rectangle.esc.js'
import * as triangleComponent from '../components/triangle.esc.js'
import * as squareComponent from '../components/square.esc.js'

import * as global from './global.js'

export const background = 100

export const __compose = [global.fillParent, sketch]


export const rectangle = rectangleComponent

export const triangle = triangleComponent

export const square = {
    x: 200,
    y: 200,
    __compose: squareComponent,
}
