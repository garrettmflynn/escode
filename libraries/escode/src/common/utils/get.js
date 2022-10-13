import version from "./latest.js"
import registry from "./schema.registry.js"
import keywords from "./keywords.registry.js"

const schemaCache = {}
export const getSchema = async (v=version) => {
    // const path = getSchemaPath(v, name)

    if (!schemaCache[v]) {
        schemaCache[v] = {}
        const og = registry[v]
        if (!og) {
            console.error('Schema not properly linked in the ESCode library', v, name)
        }
        for (let schema in og) {
            // const og = (await import(path, {assert: {type: "json"}})).default
            const keysWithDollarSign = Object.keys(og[schema]).filter(k => k.includes('$'))
            keysWithDollarSign.forEach(k => delete og[schema][k])
        }

        schemaCache[v] = og
    }
    
    return schemaCache[v]
}

export const getSchemas = async (v=version, name="component.schema.json") => {
    const o = {main: null, all: []}
    const schemas = await getSchema(v)
    const keys = Object.keys(schemas)
    o.main = schemas[name]

    keys.forEach(k => {
            o.all.push({ref: schemas[k], name: k})
      })

    return o
}

export const getNodeKeywords = (v=version) => {
    return keywords[v].nodes
}

export const getEdgeKeywords = (v=version) => {
    return keywords[v].edges
}

export const getKeywords = (v=version) => {
    const nodes = getNodeKeywords(v)
    const edges = getEdgeKeywords(v)

    return {
        nodes,
        edges
    }
}

export const getBasePath = (path) => {
    return path //.split('/').slice(-1)[0]
    .split('.').slice(0, -1).join('.')
}

export const getSchemaPath = (v=version, name="component.schema.json") => {
    return `../../versions/${v}/${name}`
}

export const getTestPath = async (v=version) => {
    const delimiter = '.'
    const versionLocationString = v.split('.').reduce((a,b) => {
    const prev = a[a.length - 1]
    a.push(prev ? `${prev}${delimiter}${b}` : b)
    return a
    }, []).join('/')

    return `../../tests/${versionLocationString}/index.esc.json`
}

export const getTest = async (v=version) => {
    const path = await getTestPath(v)
    return (await import(path, {assert: {type: "json"}})).default
}