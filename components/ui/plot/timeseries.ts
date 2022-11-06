
import * as plotter from "./utils/index";
import * as canvasComponent from '../canvas.js'

export const esAttributes = {
    style: {
        width: '100%',
        height: '100%',
        position: 'relative'
    }
}

export const esDOM = {
    signalCanvas: {
        esCompose: canvasComponent,
        esAttributes: {
            style: {
                backgroundColor: 'black'
            }
        }
    },
    
    overlayCanvas: {
        esCompose: canvasComponent,
        esAttributes: {
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px'
            }
        }
    },

    plotter: {        
        options: {
            worker: true, //use an offscreen canvas // TODO: Properly load workers from text
            overlayFont:'10px Verdana',
            overlayColor:'orange',
            generateNewLines: true,
            cleanGeneration: false,
            lines: {},
            lineWidth: 0.01,
        },
        
        esCompose: plotter
    },
}

export const esListeners = {
    'plotter.canvas': {
        'signalCanvas': {
            esTrigger: true
        },
    },
    'plotter.overlay': {
        'overlayCanvas': {
            esTrigger: true
        },
    },
}
