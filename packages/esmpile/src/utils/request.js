import * as pathUtils from "./path.js"

export const getURL = (path) => {
    let url
    try { url = new URL(path).href }
    catch { url = pathUtils.get(path, globalThis.location.href) }
    return url
}

export const handleFetch = async (path, options = {}) => {
    if (!options.fetch) options.fetch = {}
    if (!options.fetch.mode) options.fetch.mode = 'cors' // Auto-CORS Support
    const url = getURL(path)

    const progressCallback = options?.callbacks?.progress?.fetch

    const info = await fetchRemote(url, options, {
        path,
        progress: progressCallback
    })
    if (!info.buffer) throw new Error('No response received.')
    const type = info.type.split(';')[0] // Get mimeType (not fully specified)

    return {
        ...info,
        url,
        type,
    }
}

export const fetchRemote = async (url, options = {}, additionalArgs) => {

    const path = additionalArgs.path ?? url
    const pathId = pathUtils.get(pathUtils.noBase(path, options))

    const response = await globalThis.fetch(url, options.fetch)

    let bytesReceived = 0
    let buffer = [];
    let bytes = 0;

    const hasProgressFunction  = typeof additionalArgs.progress === 'function'
    const info = await new Promise(async (resolve) => {

        if (response) {


            bytes = parseInt(response.headers.get('Content-Length'), 10)
            const type = response.headers.get('Content-Type')

            // Browser Remote Parser
            if (globalThis.REMOTEESM_NODE) {
                const buffer = await response.arrayBuffer()
                resolve({ buffer, type })
            }

            // Browser Remote Parser
            else {

                const reader = response.body.getReader();

                const processBuffer = async ({ done, value }) => {

                    if (done) {
                        const config = {}
                        if (typeof type === 'string') config.type = type
                        const blob = new Blob(buffer, config)
                        const ab = await blob.arrayBuffer()
                        resolve({ buffer: new Uint8Array(ab), type })
                        return;
                    }

                    bytesReceived += value.length;
                    const chunk = value;
                    buffer.push(chunk);

                    if (hasProgressFunction) additionalArgs.progress(pathId, bytesReceived, bytes, null, null, response.headers.get('Range'))

                    // Read some more, and call this function again
                    return reader.read().then(processBuffer)
                }

                reader.read().then(processBuffer)
            }

        } else {
            console.warn('Response not received!', options.headers)
            resolve(undefined)
        }
    })


    const output = {
        response,
        ...info
    }

    if (hasProgressFunction) {
        const status = [null, null]
        if (response.ok) status[0] = output
        else status[1] = output
        additionalArgs.progress(pathId, bytesReceived, bytes, ...status, response.headers.get('Range')) // Send Done
    }


    return output
}