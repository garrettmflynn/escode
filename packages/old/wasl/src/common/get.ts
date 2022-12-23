import * as path from './utils/path'
import * as esm from 'esmpile'
import { Options } from './types'

const cache = {}
// ESM File Importer with Cache Support
const get = async (relPath, relativeTo="", onImport?, options:Options={}) => {

    let type = path.suffix(relPath)
    const isJSON = (!type || type.includes('json'))

    // Correct paths for the different locations in the filesystem
    const fullPath = (relPath[0] === '.') ? esm.resolve(relPath, relativeTo) : relPath // Use Relative vs Absolute Path
    const isFunc = typeof onImport === 'function'
    const bundle = cache[fullPath]?.imported ?? []

    if (!cache[fullPath]){

        const opts = {
            debug: true,
            callbacks: {
                progress: {
                    fetch: options.callbacks?.progress?.fetch,
                    file: options.callbacks?.progress?.file
                }
            },
            bundler: 'objecturl',
            filesystem: options.filesystem,
            nodeModules: options.nodeModules,
            relativeTo: options.relativeTo,
        }

        const bundle = new esm.Bundle(relPath, opts)

        const res = await bundle.resolve()
        if (isFunc) onImport(bundle)
        cache[fullPath] = bundle

        if (isJSON) cache[fullPath] = res?.default ?? {}
        else cache[fullPath] = res
    } else if (isFunc) onImport(bundle)

    return (isJSON) ? JSON.parse(JSON.stringify(cache[fullPath])) : cache[fullPath]
}

export default get