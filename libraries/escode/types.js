import { compileFromFile } from 'json-schema-to-typescript'
import { getBasePath } from './src/utils/get.js'
import fs from 'fs'
import version from './src/utils/latest.js'

// compile from file
const path =  `versions/${version}/component.schema.json`
const base = getBasePath(path)

compileFromFile(path)
  .then(ts => fs.writeFileSync(base + '.d.ts', ts))