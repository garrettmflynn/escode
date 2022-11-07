
import * as plotter from "../utils/index";
import * as canvasComponent from '../../canvas.js'

export const __attributes = {
    style: {
        width: '100%',
        height: '100%',
        position: 'relative'
    }
}

export const __children = {
    signalCanvas: {
        __compose: canvasComponent,
        __attributes: {
            style: {
                backgroundColor: 'black'
            }
        }
    },
    
    overlayCanvas: {
        __compose: canvasComponent,
        __attributes: {
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px'
            }
        }
    },

    plot: {        
        options: {
            worker: true, //use an offscreen canvas // TODO: Properly load workers from text
            overlayFont:'10px Verdana',
            overlayColor:'orange',
            generateNewLines: true,
            cleanGeneration: false,
            lines: {},
            lineWidth: 0.01,
        },
        
        __compose: plotter
    },
}

export const __listeners = {
    'plot.canvas': {
        'signalCanvas': {
            __trigger: true
        },
    },
    'plot.overlay': {
        'overlayCanvas': {
            __trigger: true
        },
    },
}
