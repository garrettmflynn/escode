import { esm } from './check.js'

export const drillSimple = (obj, callback, options) => {

    let accumulator = options.accumulator
    if (!accumulator) accumulator = options.accumulator = {}

    const ignore = options.ignore || []
    const path = options.path || []
    const condition = options.condition ||  true

    const seen = []
    const fromSeen = []
    
    let drill = (obj, acc={}, globalInfo) => {

        for (let key in obj) {
            if (ignore.includes(key)) continue
            const val = obj[key]
            const newPath = [...globalInfo.path, key]

            const info = {
                typeof: typeof val,
                name: val?.constructor?.name,
                simple: true,
                object: val && typeof val === 'object',
                path: newPath
            }
            if (info.object) {
                const name = info.name

                const isESM = esm(val) // make sure to catch ESM

                if (isESM || name === 'Object' || name === 'Array') {
                    info.simple = true
                    const idx = seen.indexOf(val)
                    if (idx !== -1) acc[key] =fromSeen[idx]
                    else {
                        seen.push(val)

                        const pass = condition instanceof Function ? condition(key, val, info) : condition
                        info.pass = pass
                        
                        acc[key] = callback(key, val, info)

                        if (pass) {
                            fromSeen.push(acc[key])
                            acc[key] = drill(val, acc[key], {...globalInfo, path: newPath}) // Drill simple objects
                        }
                    }
                } 
                else {
                    info.simple = false
                    acc[key] = callback(key, val, info)
                }
            } else acc[key] = callback(key, val, info)
        } 

        return acc
    }

    return drill(obj, accumulator, { path })
}