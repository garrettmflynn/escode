
import * as plotter from "../../../../components/drafts/typescript/plot/index.js";
import * as data from './components/data.js'
import * as canvasComponent from './components/canvas.js'


const width = '100%'
const height = 200
 
const sampleCt = 1
const animationRate = 256
const nSec = (1 * animationRate) * sampleCt

export const esAttributes = {
    style: {
        position: 'relative'
    }
}

export const esDOM = {
    signalCanvas: {
        width,
        height,
        esCompose: canvasComponent,
        esAttributes: {
            style: {
                backgroundColor: 'black'
            }
        }
    },
    
    overlayCanvas: {
        width,
        height,
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
            worker:true, //use an offscreen canvas
            overlayFont:'10px Verdana',
            overlayColor:'orange',
            generateNewLines: true,
            cleanGeneration: false,
            lines: {},
            lineWidth: 0.01,
            linePoints: nSec,
        },
        
        esCompose: plotter
    },
    data: {
        sampleCt,
        frequencies: [10],
        esCompose: data,
        esAnimate: animationRate
    }
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
    'plotter': 'data'
}
