import path from 'path'
import fs from 'fs'

import * as view from '../../views/index.js'
import * as filesystem from "../../utils/filesystem.js";
import * as log from "../../utils/log.js";

const getType = (filePath) => {
    return path.extname(filePath).slice(1)
}


export const fromText = (contents, from, to) => {
    return view[to][from](contents, 'text')
}

export default function convert(paths, options, command) {

    const filename = (path.path) ? path.path : paths[0]
    if (paths.paths) paths = path.paths

    const contents = fs.readFileSync(filename);

    let input = getType(filename);

    paths.forEach(path => {
        if (filename !== path) {
            let output = getType(path);

            try {

                const tic = performance.now()

                // Convert Base to Linked File Text
                const text = fromText(contents, input, output)

                // Get Original Linked File Text
                const destination = filesystem.getFileText(path);

                console.log(`Converting ${log.path(filename)} —> ${log.path(path)}`)

                // Only Update if Text is Different
                if (text !== destination) {
                    filesystem.write(path, text)
                    const toc = performance.now()
                    console.log(`${log.path(filename)} —> ${log.path(path)}: ${(toc - tic).toFixed(3)}ms`)
                }
            } catch (e) {
                console.error(`Invalid ${input}...`, filename, e)
            }
        }
    })
}