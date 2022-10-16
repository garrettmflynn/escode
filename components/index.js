// A registry of plugins for the brainsatplay library
// Note: Assign the key to match the plugin name. We don't want duplicates!

export default {
    ['Sine Wave']: 'https://raw.githubusercontent.com/brainsatplay/plugin/main/index.js'
}

export * as connect from './connect/index.js'
export * as output from './drafts/output/index.js'
export * as select from './select/index.js'
export * as basic from './basic/index.js'
export * as ui from './ui/index.js'
import community from './community/index.js'

// A registry of plugins for the brainsatplay library
// Note: Assign the key to match the plugin name. We don't want duplicates!


export {
    community
}