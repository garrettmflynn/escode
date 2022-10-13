// Manually load all components with the correct keys
import main from '../../tests/0/0.0/0.0.0/external/index.esc.json' assert {type: "json"}
import pkg from '../../tests/0/0.0/0.0.0/external/package.json' assert {type: "json"}
import * as threshold from '../../tests/0/components/threshold.js'
import * as average from '../../tests/0/components/average.js'

const path = './tests/0/0.0/0.0.0/external/index.esc.json'
const filesystem = {
    ['package.json']: pkg,
    ["components/threshold.js"]: threshold,
    ["components/average.js"]: average,
}

// Specify options
const options = {
    version: '0.0.0',
    filesystem
}


export {
    path,
    main,
    options
}