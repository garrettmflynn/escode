import { transformation } from "./nodeModules.js"
import * as pathUtils from "./path.js"

const extensionTransformations = ['ts', 'js']

const allTransformations = [null, ...extensionTransformations, transformation]


export const get = (uri) => {
    const pathExt = pathUtils.extension(uri)
    const abs = pathUtils.absolute(uri)
    const baseNodeModule = (abs) ? uri.split('/').length === 1 : false

    const noExt = !pathExt


    // Both Extension and Path Change (Potential Node Modules)
    if (!baseNodeModule && abs && noExt) {

        const mapped = extensionTransformations.map(ext => {

            return {
                extension: ext,
                name: `${transformation.name} + ${ext}`,
                handler: transformation.handler
            }
        })

        // Likely a Node Module (package.json)
        if (uri.split('/').length === 1) return [transformation, uri, ...mapped]

        // Likely a CDN link or File. Maybe a Node Module (package.json)
        else return [uri, ...mapped, transformation]
    }

    // Path Change First
    else if (abs) return [...allTransformations].reverse()

    // Extension Changes First
    else if (noExt) return [...allTransformations]

    else return []
}