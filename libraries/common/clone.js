export const deep = (obj) => {

    // return obj

    const seen = []
    const fromSeen = []
    
    let drill = (obj, acc={}) => {
        for (let key in obj) {
            const val = obj[key]
            if (val && typeof val === 'object') {
                const name = val.constructor.name
                if (name === 'Object' || name === 'Array') {
                    const idx = seen.indexOf(val)
                    if (idx !== -1) acc[key] =fromSeen[idx]
                    else {
                        seen.push(val)
                        acc[key] = Array.isArray(val) ? [] : {}
                        fromSeen.push(acc[key])
                        acc[key] = drill(val, acc[key])
                    }
                } 
                else acc[key] = val
            } else acc[key] = val
        } 

        return acc
    }

    return drill(obj)
}