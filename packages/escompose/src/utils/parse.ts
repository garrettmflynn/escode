export function getFnParamInfo(fn):Map<string, any>{
    var fstr = fn.toString();
    const matches = fstr.match(/\(.*?\)/)[0].replace(/[()]/gi,'').split(',');
    const info = new Map()
    matches.forEach(v => {
        const arr = v.split('=')
        if (arr[0]) info.set(arr[0],  (0, eval)(arr[1]))
    })

    return info
}