import * as mimeTypes from './mimeTypes.js'
import defaults from './defaults.js'

const urlSep = '://'

export const get = (path, rel = '', keepRelativeImports=false, isDirectory = false) => {

    if (url(path)) return path
    // if (!path.includes('./')) rel = '' // absolute

    let prefix = ''
    const getPrefix = (str) => {
        prefix = (str.includes(urlSep)) ? str.split(urlSep).splice(0,1) : undefined
        if (prefix) return str.replace(`${prefix}${urlSep}`, '')
        else return str
    }

    if (path.includes(urlSep)) path = getPrefix(path)
    if (rel.includes(urlSep)) rel = getPrefix(rel)

    if (!keepRelativeImports) rel = rel.split('/').filter(v => v != '..').join('/') // Remove leading ..

    if (rel[rel.length - 1] === '/') rel = rel.slice(0, -1) // Remove trailing slashes

    let dirTokens = rel.split('/')
    if (dirTokens.length === 1 && dirTokens[0] === '') dirTokens = [] // Remove consequence of empty string rel

    if (!isDirectory){
        const potentialFile = dirTokens.pop() // remove file name
        if (potentialFile) {
            const splitPath = potentialFile.split('.')
        if (splitPath.length == 1 || (splitPath.length > 1 && splitPath.includes(''))) dirTokens.push(potentialFile) // ASSUMPTION: All files have an extension
        }
    }

    const splitPath = path.split("/")
    const pathTokens = splitPath.filter((str, i) => !!str) // remove bookend slashes

    const extensionTokens = pathTokens.filter((str, i) => {
        if (str === '..') {
            dirTokens.pop() // Pop off directories
            return false
        } else if (str === '.') return false
        else return true
    })

    // Concatenate with windowLocation if rel matched OR no rel and path matched...
    const newPath = [...dirTokens, ...extensionTokens].join('/')


    // Add prefix back if it exists
    if (prefix) return prefix + '://' + newPath
    else return newPath
}


export function absolute(uri, urlWorks) {
    const absolutePath = uri[0] !== ".";
    const isRemote = url(uri);
    return absolutePath && (urlWorks || !isRemote)
}

export function url(uri) {
    try {
        new URL(uri)
        return true
    } catch {
        return false
    }
}

export const extension = (path) => {
    const ext = path.split('/').slice(-1)[0].split(".").slice(-1)[0];
    if (mimeTypes.map[ext]) return ext
}


// Remove File Name
export const base = (str) => str.substring(0, str.lastIndexOf("/"));


export const noBase = (path, opts, removeNode) => {

    path = (globalThis.location) ? path.replace(`${base(globalThis.location.href)}/`, "./") : path

    const absolutePath = absolute(path, true)
    const relativeTo = opts.relativeTo ?? defaults.nodeModules.relativeTo
    const nodeModulePath = opts.nodeModules ?? defaults.nodeModules.nodeModules
    
    // Pass Absolute
    if (absolutePath) return path

    // Keep Relative
    else {
        let noBase = path
        if (removeNode) noBase = noBase.replace(`${nodeModulePath}/`, "")
        noBase = noBase.replace(`${relativeTo.split("/").slice(0, -1).join("/")}/`, "");
        if (noBase[0] !== '.') noBase = `./${noBase}`
        return noBase
    }
}

export const pathId = (path, opts) => get(noBase(path,opts))

