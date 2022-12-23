import * as esm from './src/index.js'

const bundle = new esm.Bundle('./src/index.js', {
    relativeTo: import.meta.url,
    bundler: "datauri"
})

await bundle.resolve()
await bundle.download('./tests/bundled/index.esmpile.js')
