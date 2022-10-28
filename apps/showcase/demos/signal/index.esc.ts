
// // Extension with Plotter
// // import { initDevice } from "../../../../../../sensor_modules/node_modules/device-decoder";
// // import { CanvasControls } from "graphscript/dist/services/worker/WorkerCanvas.js";

// // import * as components from '../../../../../sensor_modules/components/index.js';
// import * as plotter from "../../../../components/drafts/typescript/plot/index.js";
// import * as data from './components/data.js'

// let canvas = document.createElement('canvas');
// let overlay = document.createElement('canvas');
// const canvasWidth = 500
// const canvasHeight = 500
// const canvasStyleWidth = `${canvasWidth}px`
// const canvasStyleHeight = `${canvasHeight}px`
// canvas.width = canvasWidth;
// canvas.height = canvasHeight;
// overlay.width = canvasWidth;
// overlay.height = canvasHeight;

// const sampleCt = 1000

// export const esDOM = {
//     canvas: {
//         esElement: canvas,
//         esAttributes: {
//             style: {
//                 backgroundColor: 'black',
//                 width: canvasStyleWidth,
//                 height: canvasStyleHeight
//             }
//         },
        
//     },
//     overlay: {
//         esElement: overlay,
//         esAttributes: {
//             style: {
//                 position: 'absolute',
//                 width: canvasStyleWidth,
//                 height: canvasStyleHeight,
//                 top: '0px',
//                 left: '0px'
//             }
//         }
//     },
//     plotter: {
        
//         options: {
//             worker:true, //use an offscreen canvas
//             canvas,
//             overlay,
//             overlayFont:'10px Verdana',
//             overlayColor:'orange',
//             generateNewLines: true,
//             cleanGeneration: false,
//             lines: {}
//         },
        
//         esCompose: plotter
//     },
//     data: {
//         sampleCt,
//         esCompose: data,
//         esAnimate: true
//     }
// }

// export const esListeners = {
//     'plotter': 'data'
// }



// Extension with Plotter
// import { initDevice } from "../../../../../../sensor_modules/node_modules/device-decoder";
// import { CanvasControls } from "graphscript/dist/services/worker/WorkerCanvas.js";

// import * as components from '../../../../../sensor_modules/components/index.js';
import * as plotter from "../../../../components/drafts/typescript/plot/index.js";
import * as data from './components/data.js'
import * as canvasComponent from './components/canvas.js'


const width = '100%'
const height = 200
const sampleCt = 1000

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
        },
        
        esCompose: plotter
    },
    data: {
        sampleCt,
        frequencies: [10],
        esCompose: data,
        esAnimate: true
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
