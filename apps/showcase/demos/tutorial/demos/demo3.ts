
// Extension with Plotter
// import { initDevice } from "../../../../../../sensor_modules/node_modules/device-decoder";
// import { CanvasControls } from "graphscript/dist/services/worker/WorkerCanvas.js";

// import * as components from '../../../../../sensor_modules/components/index.js';
import * as plotter from "../../../../../../sensor_modules/modules/webglplot/plotter.js";
import * as data from '../components/data.js'

let canvas = document.createElement('canvas');
let overlay = document.createElement('canvas');
const canvasWidth = 500
const canvasHeight = 500
const canvasStyleWidth = `${300}px`
const canvasStyleHeight = `${300}px`
canvas.width = canvasWidth;
canvas.height = canvasHeight;
overlay.width = canvasWidth;
overlay.height = canvasHeight;

let sampleCt = 1000

const plotterInstance = Object.assign(Object.assign({}, plotter), {
    options: {
        worker:true, //use an offscreen canvas
        canvas,
        overlay,
        overlayFont:'1em Verdana',
        overlayColor:'orange',
        lines: {
            '0':{
                values:new Array(sampleCt).fill(0).map((v,i)=>{ return 0.5*Math.sin(2*Math.PI*(25)*(Date.now()/1000+(i/sampleCt))); }),
                //width:2,
                color:[0,255,0,1]
            },
            '1':{
                values:new Array(sampleCt).fill(0).map((v,i)=>{ return 0.5*Math.sin(2*Math.PI*(1)*(Date.now()/1000+(i/sampleCt))); }),
                //width:2,
                color:[0,255,0,1]
            },
            '2':{
                values:new Array(sampleCt).fill(0).map((v,i)=>{ return 0.5*Math.sin(2*Math.PI*(3)*(Date.now()/1000+(i/sampleCt))); }),
                //width:2,
                color:[0,255,0,1]
            }
        }
    }
});

export const esComponents = {
    canvas: {
        esElement: {
            element: canvas,
            // attributes: {
            //     width: canvasWidth,
            //     height: canvasHeight,
            // },
            style: {
                backgroundColor: 'black',
                width: canvasStyleWidth,
                height: canvasStyleHeight
            }
        },
        
    },
    overlay: {
        esElement: {
            element: overlay,
            // attributes: {
            //     width: canvasWidth,
            //     height: canvasHeight,
            // },
            style: {
                position: 'absolute',
                width: canvasStyleWidth,
                height: canvasStyleHeight,
                top: '0px',
                left: '0px'
            }
        },
    },
    plotter: {
        esCompose: plotterInstance
    },
    data: {
        sampleCt,
        esCompose: data,
    },
    trigger: {
        esTrigger: [true],
        default: (input) => input
    }
}

export const esListeners = {
    data: 'plotter',
    trigger: 'data.start'
}
