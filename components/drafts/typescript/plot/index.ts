import {WebglLinePlotUtil, WebglLinePlotProps} from 'webgl-plot-utils';//'../../../webgl-plot-utils/webgl-plot-utils'//
let plotter = new WebglLinePlotUtil();

import canvasworker from './canvas.worker'

import { CanvasControls, CanvasProps, workerCanvasRoutes } from 'graphscript/services/worker/WorkerCanvas' //../../../GraphServiceRouter/services/worker/WorkerCanvas'//'graphscript/services/worker/WorkerCanvas';

// provide the functions for the canvas routes, in our case wrapping the webglplot renderer instead of our own canvas render
const init = (options, canvas, context) => {

    plotter.initPlot(options);

    canvas.addEventListener('resize',(o) => {        
        canvas.width = o.width; canvas.height = o.height;
        ((plotter.plots[options._id].plot as any).webgl as WebGLRenderingContext).viewport(0, 0, canvas.width, canvas.height);
    })
}

const update = (options, canvas, context, input) => {
    plotter.update(options._id, input);
}

const clear = (options, canvas, context) => {
    plotter.deinitPlot(options._id);   
}

export let plot:CanvasControls

export let options: CanvasProps & {
        overlay?:HTMLCanvasElement, 
        worker?:boolean|Worker|string|Blob|MessagePort, 
        route?:string
    } & WebglLinePlotProps


function create(context) {

    const options = context.options
    options.init = init;
    options.update = update;
    options.clear = clear;


    // Grab Canvas from DOM
    if (typeof options.overlay === 'string') options.overlay = document.querySelector(options.overlay) as HTMLCanvasElement;
    if (typeof options.canvas === 'string') options.canvas = document.querySelector(options.canvas) as HTMLCanvasElement;


    if(options.worker) {

        if(options.worker === true) options.worker = new Worker(canvasworker);
        else if (typeof options.worker === 'string' || options.worker instanceof Blob) options.worker = new Worker(options.worker as any);
        
        if(options.overlay) {
            let offscreen = (options.overlay as any).transferControlToOffscreen();
            options.overlay = offscreen;
            options.transfer = [options.overlay];
        }
    }

    context.plot = workerCanvasRoutes.Renderer(options) as CanvasControls;
    return context.plot
}

export default function (args) {
    if (!this.plot) create(this) // NOTE: Using global scope will result in issues since the (wrapper) promise is not awaited
    this.plot.update(args);
}