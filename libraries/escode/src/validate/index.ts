import { getSchemas } from "../common/utils/get.js"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import latest from "../common/utils/latest.js"
import { LatestESC, Options } from "../common/types/index.js"
import get from "../common/get.js"
import * as check from '../common/utils/check'

let activeVersion = null
const ajv = new Ajv({
    allErrors: true,
    allowUnionTypes: true
    // strictRequired: false //"log"
})
addFormats(ajv)

// Validate the data against the registered JSON Schema schema for ESC
// Options: 
//     - Provide a url and a options.relativeTo entry (locally served + Node.js only)
//     - Provide a file object (any)

const validate = async (urlOrObject, options:Options={}) => {

    const clone = Object.assign({errors: [], warnings: []}, options)
    
    let {version, relativeTo, errors, warnings} = clone
    if (!version) version = latest

    let schemaValid;
    let data = urlOrObject

    try {
        new URL(urlOrObject) // Resolve remote URLs
        clone._remote = urlOrObject
        delete clone.relativeTo
        relativeTo = ''
    } catch {}

    // Check Input
    const inputErrors = check.valid(urlOrObject, clone, 'validate')
    const inputIsValid = inputErrors.length === 0
    errors.push(...inputErrors)

    // Check First Path
    if (typeof urlOrObject === 'string') {

        data = await get(urlOrObject, relativeTo, undefined, options).catch(e => {
            errors.push({ 
                message: e.message,
                file: urlOrObject
            })

        console.log('Got!', data)
    }) as LatestESC
    }

    // Schema Validation
    let esc;
    if (errors.length === 0) {

        activeVersion = version
        let schemas = await getSchemas(version)
        const schemaCopy = JSON.parse(JSON.stringify(schemas.main))

        schemas.all.forEach(s => {
            const schema = ajv.getSchema(s.name)
            if (!schema) ajv.addSchema(s.ref, s.name)
        })
        const ajvValidate = await ajv.compile(schemaCopy)
        schemaValid = ajvValidate(data)
        if (ajvValidate.errors) errors.push(...ajvValidate.errors)
}

    // Return loaded ESC instance if available
    return schemaValid && inputIsValid
}

export default validate
