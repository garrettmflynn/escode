export const __element = 'canvas'

export const __compose = "./compiled/graphics.wasm" // Uses wasm.load under the hood

export const __attributes = {
    width:"20",
    height:"20",
    style: {
        'imageRendering': "pixelated",
        'width': '100%'
    }
}

export let context;
export let data;

export function __onconnected () {

  // Set up Context and ImageData on the canvas
  this.context = this.__element.getContext("2d");
  this.image = this.context.createImageData(  this.__element.width, this.__element.height );

  // Clear the canvas
  this.context.clearRect(0, 0, this.__element.width, this.__element.height);
}


export const __animate = 1

export const getDarkValue = () => Math.floor(Math.random() * 100);
export const getLightValue = () =>  Math.floor(Math.random() * 127) + 127;

export default function () {
  // const checkerBoardSize = 20;

  // Generate a new checkboard in wasm
  this['generateCheckerBoard'](
      this.getDarkValue(),
      this.getDarkValue(),
      this.getDarkValue(),
      this.getLightValue(),
      this.getLightValue(),
      this.getLightValue()
  );


  // Get our memory object from the exports
  // Create a Uint8Array (on first get) to give us access to Wasm Memory
  // Pull out the RGBA values from Wasm memory, the we wrote to in wasm,
  // starting at the checkerboard pointer (memory array index)
  const imageDataArray = this.memory.slice(this['CHECKERBOARD_BUFFER_POINTER'], this['CHECKERBOARD_BUFFER_SIZE']);

  // Set the values to the canvas image data
  this.image.data.set(imageDataArray);

  // Clear the canvas
  this.context.clearRect(0, 0, this.__element.width, this.__element.height);

  // Place the new generated checkerboard onto the canvas
  this.context.putImageData(this.image, 0, 0);
};