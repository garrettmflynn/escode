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


const getNamesFromURI = (uri) =>{
    const names = new Set()

    // Node Module Name
    const nodeName = uri.split('/node_modules/')[1].split('/')[0]
    if (nodeName) names.add(nodeName)

    const firstFilenameString = uri.split('/').slice(-1)[0].split('.')[0]
    if (firstFilenameString) names.add(firstFilenameString)

    return Array.from(names)
}

async function get(encoder, input, uriForExtension, mimeType, names) { // TODO: Remove default name

    
    let encoded, module
    if (!mimeType){
        const pathExt = pathUtils.extension(uriForExtension)
        mimeType = mimeTypes.get(pathExt)
    }

    let isJSON = mimeType === 'application/json'
    
    try {
        encoded = encoder(input, mimeType);

        module = await importEncoded(encoded, isJSON) // check if datauri will work to be imported. Otherwise try different methods and flag for import replacement
        
        // Catch modules that have been loaded onto the global scope
        // TODO: Make sure this is saveable like the other datauri
        const keys = Object.keys(module)
        if (keys.length === 0 || (keys.length === 1  && keys.includes('__esmpileSourceBundle'))) {

            if (!names) names = getNamesFromURI(uriForExtension)

            const name = names.find((name) => globalThis[name])
           if (name) {
                 module = {default: globalThis[name]} // if no name is found, module will be null
                encoded = get(encoder, `export default globalThis['${name}']`, uriForExtension, mimeType, names) // replace with global default reference
           } else {
            console.warn(`Could not get global reference for ${uriForExtension} after failing to import using ESM import syntax.`)
           }
        }
    }

    // Handle Exceptions
    catch (e) {
        encoded = encoder(input, mimeType, true);
        if (mimeTypes.isJS(mimeType)) {
            if (!names) names = getNamesFromURI(uriForExtension)
                module = encoded = await catchFailedModule(encoded, e, names).catch((e) => {
                throw e
            }); // javascript script tag imports
        }
        else module = encoded // audio / video assets
    }

    return {
        encoded,
        module
    }
}

async function catchFailedModule (uri, e, names){


    if (
        e === true || // Force
        e.message.includes('The string to be encoded contains characters outside of the Latin1 range.') // cannot be represented as a datauri
        || e.message.includes('Cannot set properties of undefined') // will not appropriately load to the window
    ) return await load.script(uri, names)
    else throw e
}