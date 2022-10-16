// Manually load all components with the correct keys
import main from '../../tests/0/0.0/0.0.0/basic/index.esc.json' assert {type: "json"}
import pkg from '../../tests/0/0.0/0.0.0/basic/package.json' assert {type: "json"}
import pluginPkg from '../../tests/0/components/plugin/package.json' assert {type: "json"}
import plugin from '../../tests/0/components/plugin/index.esc.json' assert {type: "json"}
import math from '../../tests/0/components/math/index.esc.json' assert {type: "json"}
import * as log from "../../tests/0/components/log.js"
import * as add from "../../tests/0/components/math/add.js"
import * as add2 from "../../tests/0/components/math/add2.js"
import * as multiply from "../../tests/0/components/math/multiply.js"
import * as multiply2 from "../../tests/0/components/math/multiply2.js"

import number from '../../tests/0/0.0/0.0.0/basic/number.js'

const path = './tests/0/0.0/0.0.0/basic/index.esc.json'
const filesystem = {
    ['package.json']: pkg,
    ['components/plugin/index.esc.json']: plugin,
    ["components/log.js"]: log,
    ['components/math/index.esc.json']: math,
    ["components/math/add.js"]: add,
    ["components/math/add2.js"]: add2,
    ["components/math/multiply.js"]: multiply,
    ["components/math/multiply2.js"]: multiply2,
    ['components/plugin/package.json']: pluginPkg,
    ['number.js']: number
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