import { js } from '../mimeTypes.js'

export function get(input, mimeType = js) {
    if (typeof input === 'string') input = new TextEncoder().encode(input);
    const blob = new Blob([input], { type: mimeType })
    return URL.createObjectURL(blob)
}