import {WebglLinePlotUtil, WebglLinePlotProps} from 'webgl-plot-utils';//'../../../webgl-plot-utils/webgl-plot-utils'//
let plotter = new WebglLinePlotUtil();

import canvasworker from './canvas.worker' // NOTE: This breaks on text compilation...

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

export let canvas: WebglLinePlotProps['canvas']
export let overlay: WebglLinePlotProps['overlay']

export const failed = false


function create(context) {

    const options = context.options
    options.init = init;
    options.update = update;
    options.clear = clear;

    // Grab Canvas from DOM
    if (typeof context.overlay === 'string') context.overlay = document.querySelector(context.overlay) as HTMLCanvasElement;
    if (typeof context.canvas === 'string') context.canvas = document.querySelector(context.canvas) as HTMLCanvasElement;

    options.canvas = context.canvas;
    options.overlay = context.overlay;
    const originalOptions = {...options}

    try {
        if(options.worker) {

            if(options.worker === true) {
                if (typeof canvasworker === 'object') options.worker = canvasworker;
                else options.worker = new Worker(canvasworker);
            } else if (typeof options.worker === 'string' || options.worker instanceof Blob) options.worker = new Worker(options.worker as any);
            
            if(options.overlay) {
                let offscreen = (options.overlay as any).transferControlToOffscreen();
                options.overlay = offscreen;
                options.transfer = [options.overlay];
            }
        }

        context.plot = workerCanvasRoutes.Renderer(options) as CanvasControls;
    } catch (e) {

        // Resetting
        originalOptions.worker = false;

        // Plotting
        try {
            context.plot = workerCanvasRoutes.Renderer(originalOptions) as CanvasControls;
            console.warn('Could not create canvas with worker. Using a standard canvas instead', originalOptions)
        } catch {
            console.error('Could not create a plot using the current options')
            context.failed = true
        }
  
    }
    return context.plot
}

export default function (args) {
    if (!this.failed){
        if (!this.plot) create(this) // NOTE: Using global scope will result in issues since the (wrapper) promise is not awaited
        if (this.plot) this.plot.update(args);
    }
}