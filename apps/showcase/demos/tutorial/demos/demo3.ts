
// Extension with Plotter
// import { initDevice } from "../../../../../../sensor_modules/node_modules/device-decoder";
// import { CanvasControls } from "graphscript/dist/services/worker/WorkerCanvas.js";

// import * as components from '../../../../../sensor_modules/components/index.js';
import * as plotter from "../../../../../components/drafts/typescript/plot/index.js";
import * as data from '../components/data.js'

let canvas = document.createElement('canvas');
let overlay = document.createElement('canvas');
const canvasWidth = 500
const canvasHeight = 500
const canvasStyleWidth = `${canvasWidth}px`
const canvasStyleHeight = `${canvasHeight}px`
canvas.width = canvasWidth;
canvas.height = canvasHeight;
overlay.width = canvasWidth;
overlay.height = canvasHeight;

let sampleCt = 1000


const ogArray = new Array(sampleCt).fill(0)
const color = [0,255,0,1]
const plotterInstance = Object.assign(Object.assign({}, plotter), {
    options: {
        worker:true, //use an offscreen canvas
        canvas,
        overlay,
        overlayFont:'10px Verdana',
        overlayColor:'orange',
        generateNewLines: true,
        cleanGeneration: false,
        lines: {}
    }
});

export const esDOM = {
    canvas: {
        esElement: canvas,
        esAttributes: {
            style: {
                backgroundColor: 'black',
                width: canvasStyleWidth,
                height: canvasStyleHeight
            }
        },
        
    },
    overlay: {
        esElement: overlay,
        esAttributes: {
            style: {
                position: 'absolute',
                width: canvasStyleWidth,
                height: canvasStyleHeight,
                top: '0px',
                left: '0px'
            }
        }
    },
    plotter: {
        esCompose: plotterInstance
    },
    data: {
        sampleCt,
        esCompose: data,
        // esAnimate: true
    }
}

export const esListeners = {
    data: 'plotter'
}
