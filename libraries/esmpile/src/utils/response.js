import * as transformations from './transformations.js'
import * as handlers from './handlers.js'
import * as pathUtils from "./path.js";
import { handleFetch } from "./request.js";

// Get ESM Module Info
const enc = new TextDecoder("utf-8");
export const get = async (uri, opts, expectedType) => {

    // Node
    const info = { uri, text: {original: '', updated: ''}, buffer: null }
    if (globalThis.REMOTEESM_NODE){
        const absPath = uri.replace('file://', '')
        info.buffer = globalThis.fs.readFileSync(absPath)
        info.text.original = info.text.updated = enc.decode(info.buffer)
    } 

    // Browser
    else {
        const fetchInfo = await handleFetch(uri, opts)
        const response = fetchInfo.response

        info.response = response
        if (response.ok) {
            if (expectedType) {
                const mimeType = response.headers.get("Content-Type")
                if (!mimeType.includes(expectedType)) throw new Error(`Expected Content Type ${expectedType} but received ${mimeType} for  ${uri}`)
            }

            info.buffer = fetchInfo.buffer
            info.text.original = info.text.updated = enc.decode(info.buffer)
        } else {
            throw new Error(response.statusText)
        }
    }

    return info
}

export const find = async(uri, opts, callback) => {
    
     // Try Alternative File Paths
     const transArray = transformations.get(uri)

     let response;
 
     if (transArray.length > 0) {
         do {
             const ext = transArray.shift()
 
             const name = ext?.name ?? ext
             const warning = (e) => {
                 if (opts.debug) console.error(`Import using ${name ?? ext} transformation failed for ${uri}`)
             }
 
             const transformed = await handlers.transformation(uri, ext, opts)
             const correctURI = pathUtils.get(transformed, opts.relativeTo)
             const expectedType = (ext) ? null : 'application/javascript'
             response = await callback(correctURI, opts, expectedType).then(res => {
                if (opts.debug) console.warn(`Import using ${name ?? ext} transformation succeeded for ${uri}`)
                return res
            }).catch(warning)
         } while (!response && transArray.length > 0)
 
         if (!response) throw new Error(`No valid transformation found for ${uri}`)
     }
 
     // Get Specified URI Directly
     else response = await callback(pathUtils.get(uri, opts.relativeTo), opts);

    return response
}


export const findModule = async (uri, opts) => {
    const pathExt = pathUtils.extension(uri)
    const isJSON = pathExt === "json";

    const info = {}
    await find(uri, opts, async (transformed) => {
        info.uri = transformed
        info.result = await (isJSON ? import(transformed, { assert: { type: "json" } }) : import(transformed))
    })

    return info
}

// Get ESM Module Text
export const findText = async (uri, opts) => await find(uri, opts, get)