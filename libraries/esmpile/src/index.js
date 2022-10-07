import * as pathUtils from "./utils/path.js";
import * as nodeModules from './utils/nodeModules.js'
import * as sourceMap from './utils/sourceMap.js'
import * as load from './utils/load.js'
import * as bundle from "./Bundle.js";

export const resolve = pathUtils.get
export const path = pathUtils

// ------------- OOP Usage -------------
export const Bundle = bundle.default

// ------------- Functional Usage -------------
export const compile = async (uri, opts = {}) => {
    opts = Object.assign({}, opts) // copy options
    const thisBundle = bundle.get(uri, opts) // grab or create bundle
    await thisBundle.resolve()
    return thisBundle.result;
};

export default compile

export {
    sourceMap,
    nodeModules,
    load,
    bundle
}