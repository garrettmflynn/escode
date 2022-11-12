import * as sketch from './components/sketch.esc.js'

// Shapes
import * as rectangle from './components/rectangle.esc.js'
import * as triangle from './components/triangle.esc.js'
import * as square from './components/square.esc.js'


const fillParent = {
    __attributes: {
        style: {
            width: '100%',
            height: '100%',
        }
    },
}

export const __attributes = {
    style: {
        display: 'flex'
    }
}

export const __compose = [fillParent]
export const __children = {

    // First Sketch
    p1: {
       background: 100,
        __compose: [fillParent, sketch],
        __children: {
            rectangle,
            triangle,
            square: {
                x: 200,
                y: 200,
                __compose: square,
            }
        }
    }, 
    
    // Second Sketch
    p2: {
        background: 200,
        __compose: [fillParent, sketch],
        __children: {
            rectangle
        }
    }
}


export const __listeners = {

}