import * as positionParams from './properties/position.esc.js';
import * as radiusParams from './properties/radius.esc.js';
import * as sizeParams from './properties/size.esc.js';
import * as colorParams from './properties/color.esc.js';

export const __compose = [radiusParams, sizeParams, positionParams, colorParams]

export default function (sketchComponent) {
    sketchComponent.fill(this.fill);
    sketchComponent.rect(this.x, this.y, this.width, this.height);
}