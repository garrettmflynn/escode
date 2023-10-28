

import * as positionParams from './properties/position.esc.js';
import * as radiusParams from './properties/radius.esc.js';
import * as colorParams from './properties/color.esc.js';

export const __compose = [radiusParams, positionParams, colorParams]

export const s = 55 // Unique size parameter

export default function (sketchComponent) {
    sketchComponent.fill(this.fill);
    sketchComponent.square(this.x, this.y, this.s, this.tl, this.tr, this.br, this.bl);
}