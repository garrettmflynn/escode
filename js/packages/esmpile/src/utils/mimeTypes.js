// Mime Type Resolution
export const js = 'application/javascript'
export const isJS = (type) => !type || type === 'application/javascript'
export const map = {
    'js': js,
    'mjs': js,
    'cjs': js,
    "ts": "text/typescript",
    'json': "application/json",
    'html': 'text/html',
    'css': 'text/css',
    'txt': 'text/plain',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',

    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'application/ogg',
    'wav': 'audio/wav'
}

export const get = (extension) => map[extension]
