import path from 'path'
import chokidar from 'chokidar'
import convert from '../convert/index.js'

export default function watch(paths, options, command) {
    if (paths.length === 0) throw new Error('No paths provided')
    
    const __dirname = process.cwd()
    paths = paths.map((dir) => path.join(__dirname, dir)) // convert to absolute paths

    var watcher = chokidar.watch(paths, {
        ignored: /(node_modules)|(.git)/
    });

    watcher.on('change', (path) => convert({
        path,
        paths
    }))


    const base = paths[0]
    convert(base, paths) // Always reinitialize from base
}