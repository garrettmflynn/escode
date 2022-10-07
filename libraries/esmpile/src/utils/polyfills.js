// Node Polyfills

export let fetch;
export let fs;
export let Blob;

const isReady = new Promise(async (resolve, reject) => {

    try {
        if (typeof process === 'object') { //indicates node

            // Fetch
            if (!fetch) {
                globalThis.REMOTEESM_NODE = true
                fetch = globalThis.fetch = (await import('node-fetch')).default
                if (typeof globalThis.fetch !== 'function') globalThis.fetch = fetch
            }
            // FS
            if (!fs) fs = globalThis.fs = (await import('fs')).default

            // Blob
            if (!Blob) {
                const buffer = (await import('node:buffer')).default
                Blob = globalThis.Blob = buffer.Blob
            }
            resolve(true)
        } else resolve(true)

    } catch (err) {
        reject(err)
    }
})

export const ready = isReady