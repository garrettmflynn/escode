import { setFromPath } from "../../common/pathHelpers"
import Inspectable from "./inspectable"
import { MonitorOptions, SetFromOptionsType } from "./types"

export const setFromOptions = (path, value, baseOptions: MonitorOptions, opts: SetFromOptionsType) => {

        const ref = opts.reference
        
        const id = (Array.isArray(path)) ? path[0] : (typeof path === 'string') ? path.split(baseOptions.keySeparator)[0] : path
        let isDynamic = opts.hasOwnProperty('static') ? !opts.static : false

        if (isDynamic && !globalThis.Proxy) {
            isDynamic = false
            console.warn('Falling back to using function interception and setters...')
        }

        if (isDynamic) {
            value = new Inspectable(value, {
                pathFormat: baseOptions.pathFormat,
                keySeparator: baseOptions.keySeparator,
                listeners: opts.listeners,
                path: (path) => path.filter((str) => !baseOptions.fallbacks || !baseOptions.fallbacks.includes(str)),
                // listenDeeper: ['__isESComponent'],
                // listenDeeper: ['test']
            }, id)
        }

        let options = {keySeparator: baseOptions.keySeparator, ...opts}
        setFromPath(path, value, ref, options)

        return value
    }