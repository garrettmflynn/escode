import * as errors from './errors.js'
import * as pathUtils from './path.js';

export const noExtension = (path, repExt = 'js') => {
    const absolutePath = pathUtils.absolute(path);
    const split = path.split('/')
    const ext = pathUtils.extension(path)
    if (!absolutePath || (absolutePath && split.length > 1)) {
        if (!ext) return `${path}.${repExt}` // use alternative extension
    }

    return path
}

export const transformation = async (path, transformation, opts, force) => {
    if (!transformation) return path
    const type = typeof transformation
    if (type === 'string' && (!force || force === 'string')) {
        return noExtension(path, transformation)
    }
    else if (type === 'object' && (!force || force === 'object')) {
        if (transformation.extension) path = noExtension(path, transformation.extension) // first transform with the extension
        return await transformation.handler(path, opts).catch(e => {
            throw errors.create(path, pathUtils.noBase(path, opts))
        })
    }
}