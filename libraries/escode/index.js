// import * as esc from "./dist/index.esm.js"
import ESC from "./src/core/index"
import validate from "./src/validate/index"
import * as html from "./src/core/html"

// Working Demos
import { path, main, options } from './demos/basic/0.0.0.js'
// import { path, main, options } from './demos/phaser.js' // Reference mode only 

// Broken Demos (because of absolute paths in source files)
// import { path, main, options } from './demos/external/0.0.0.js'


const useHTML = false

const printError = (arr, type, severity='Error') => {
    arr.forEach(e => {
        const log = (severity === 'Warning') ? console.warn : console.error
        log(`${severity} (${type})`, e)
    })
}

const referenceDiv = document.getElementById('reference') 
const importDiv = document.getElementById('import')
const generatedDiv = document.getElementById('generated')

const startExecution = async () => {

    options.path = path // must include
    options.activate = true // use internal graph system
    // options.output = 'object'
    options.forceImportFromText = true
    options.debug = true
    options.relativeTo =  window.location.href // import.meta.url
    options.callbacks = {
        progress: {
            source: (label, i, total) => {
                console.log('Source', label, i, total)
            },
            components: (label, i, graph) => {
                console.log('Remote Component', label, i, graph)
            },
            file: (path, i, total, done, failed) => {
                if (failed) console.error(`${path} failed`, failed)
                else if (done) console.log(`${path} done!`)
                else console.log('File', path, i, total)
            },
            fetch: (path, i, total, done, failed) => {
                if (failed) console.error(`${path} fetch failed`, failed)
                else if (done) console.log(`${path} fetch done!`)
                else console.log('Fetch', path, i, total)
            },
        }
    }

    // Option #1: Import Mode
    let imported = await runMode(path, options, 'import')

    // // Option #2: Reference Mode (not possible for remote files in Node.js)
    let ref = await runMode(main, options, 'reference')

    let info = [
        {esc: imported, div: importDiv,  name: "Import"}, 
        {esc: ref, div: referenceDiv,  name: "Reference"},
    ]

    // Option #3: HTML Mode
    const generationContainer = document.getElementById('generatedcontainer') 
    if (useHTML){
        const copy = Object.assign({}, options)
        copy.parentNode = generationContainer
        html.to(main, copy)
        let generated = await runMode(generationContainer, options, 'generated')
        info.push( {esc: generated, div: generatedDiv,  name: "HTML"})
    } else generationContainer.parentNode.remove()

    let refArr = []

    for (let i in info){
        let o = info[i]
        console.log('info', o)
        if (o.esc) {
            console.log(`------------------ ${o.name.toUpperCase()} MODE ------------------`)
            await o.esc.init()
            await o.esc.start()


            console.log('Original', o.esc.original)
            console.log('Resolved', o.esc.resolved)

            try {
                const str = JSON.stringify(o.esc.original, null, 2)
                o.div.value = str
            } catch {
                o.div.value = o.esc.original
            }

            refArr.push(o.esc.original)

        } else o.div.value = undefined
    }

    if (refArr[0] && refArr[1] && refArr[2])  console.warn('One of the modes has failed for this example!')

} 


startExecution()


async function runMode(input, options, name='import') {

    let esc;

    if (input) {
        console.log(`Starting ${name} mode`)
        const optionsCopy = Object.assign({errors: [], warnings: []}, options)
        optionsCopy.parentNode = document.getElementById(`${name}container`) // set parent node

        const schemaValid = await validate(input, optionsCopy)
        console.log(`validate (${name})`, schemaValid)
        if (schemaValid) {
            esc = new ESC(input, optionsCopy)
            console.log(`load (${name})`, esc)
            await esc.init()
            const loadValid = await validate(esc, options)
            if (!loadValid) console.error('Invalid Loaded ESC Object')
        } else console.error('Invalid ESC Schema')

        printError(optionsCopy.errors, 'import')
        printError(optionsCopy.warnings, 'import', "Warning")
    }

    return esc
}