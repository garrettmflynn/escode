
import * as colorParams from './properties/color.esc.js';

export const __compose = [colorParams]

// Unique Position Parameters
export const x1 = 30
export const y1 = 75
export const x2 = 58
export const y2 = 20
export const x3 = 86
export const y3 = 75

export default function (sketchComponent) { 
    sketchComponent.fill(this.fill);
    sketchComponent.triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
}