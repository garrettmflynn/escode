import * as pathUtils from './path.js'
import * as response from './response.js'

// source map regex
const sourceReg = /\/\/# sourceMappingURL=(.*\.map)/

export const get = async (uri, opts, text, evaluate = true) => {

    if (!text) {
        const info = await response.get(uri, opts) // get text
        text = info.text.original
    }

    if (text) {
        const srcMap = text.match(sourceReg)

        if (srcMap) {
            const getMap = async () => {
                const loc = pathUtils.get(srcMap[1], uri);
                let info = await response.get(loc, opts) // get text
                let newText = info.text.original

                // remove source map invalidation
                if (newText.slice(0, 3) === ")]}") {
                    console.warn('Removing source map invalidation characters')
                    newText = newText.substring(newText.indexOf('\n'));
                }

                // return source map
                const outInfo = { result: JSON.parse(newText) }
                outInfo.text = {original: newText, updated: null}
                return outInfo
            }

            return evaluate ? getMap() : getMap
        }
    }
}