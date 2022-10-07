import * as datauriEncoder from './datauri.js'
import * as objecturlEncoder from './objecturl.js'

import * as pathUtils from "../path.js";
import * as load from "../load.js";
import * as mimeTypes from '../mimeTypes.js'

export const datauri = async (...args) => await get(datauriEncoder.get, ...args)
export const objecturl = async (...args) => await get(objecturlEncoder.get, ...args)

const importEncoded = async (uri, isJSON) => await ((isJSON) ? import(uri, { assert: { type: "json" } }) : import(uri)).catch((e) => {
    throw e
});

async function get(encoder, input, uriForExtension, mimeType) {
    
    let encoded, module
    if (!mimeType){
        const pathExt = pathUtils.extension(uriForExtension)
        mimeType = mimeTypes.get(pathExt)
    }

    let isJSON = mimeType === 'application/json'
    
    try {
        encoded = encoder(input, mimeType);
        module = await importEncoded(encoded, isJSON) // check if datauri will work to be imported. Otherwise try different methods and flag for import replacement
    }

    // Handle Exceptions
    catch (e) {
        encoded = encoder(input, mimeType, true);
        if (mimeTypes.isJS(mimeType)) module = encoded = await catchFailedModule(encoded, e).catch((e) => {
            // console.error('Failed to load module', path, info, e)
            throw e
        }); // javascript script tag imports
        else module = encoded // audio / video assets
    }

    return {
        encoded,
        module
    }
}

async function catchFailedModule (uri, e){
    if (
        e.message.includes('The string to be encoded contains characters outside of the Latin1 range.') // cannot be represented as a datauri
        || e.message.includes('Cannot set properties of undefined') // will not appropriately load to the window
    ) return await load.script(uri)
    else throw e
}