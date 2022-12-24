import { setFromPath } from "../../common/pathHelpers"
import Inspectable from "../../esmonitor-proxy/src/index"
import { MonitorOptions, SetFromOptionsType } from "./types"


let ranError = false

export const setFromOptions = (path, value, baseOptions: MonitorOptions, opts: SetFromOptionsType) => {

        const ref = opts.reference
        
        const id = (Array.isArray(path)) ? path[0] : (typeof path === 'string') ? path.split(baseOptions.keySeparator)[0] : path
        let isDynamic = opts.hasOwnProperty('static') ? !opts.static : false

        if (isDynamic && !globalThis.Proxy) {
            isDynamic = false
            console.warn('Falling back to using function interception and setters...')
        } else if (!ranError) {
                console.error('TODO: Finish integration of esmonitor-proxy with the core...')
                ranError = true
        }

        // if (isDynamic) {
        //     isDynamic = false
        //     console.warn('Falling back to using function interception and setters...')
        //     console.error('TODO: Finish integration of esmonitor-proxy with the core...')
        // }

        if (isDynamic) {
            value = new Inspectable(value, {
                pathFormat: baseOptions.pathFormat,
                keySeparator: baseOptions.keySeparator,
                listeners: opts.listeners,
                path: (path) => path.filter((str) => !baseOptions.fallbacks || !baseOptions.fallbacks.includes(str)),
                // listenDeeper: ['__path'],
                // listenDeeper: ['test']
            }, id)
        }

        let options = {keySeparator: baseOptions.keySeparator, ...opts}
        setFromPath(path, value, ref, options)

        return value
    }