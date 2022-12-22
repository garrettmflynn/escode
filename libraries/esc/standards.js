export const keySeparator = '.'

export const defaultPath = 'default'

export const esSourceKey = '__esmpileSourceBundle'


export const defaultProperties = {
    isGraphScript: '__',
    default: defaultPath,
    hierarchy: '__children',
    parent: '__parent',
    promise: '__childresolved',

    component: '__component',
    proxy: '__proxy' // Handled by ESMonitor for Listeners
}

export const specialKeys = {

   ...defaultProperties,

    start: '__onconnected', // asked to start
    stop: '__ondisconnected',
    connected: '__connected', // wait until connected
    resolved: '__resolved', // wait until fully resolved
    started: '__started', // wait until started

    hierarchy: '__children',
    element: '__element',
    webcomponents: '__define',
    attributes: '__attributes',

    listeners: {
        value: '__listeners',
        branch: '__branch',
        bind: '__bind',
        trigger: '__trigger',
        format: '__format',
    },

    trigger: '__trigger',
    compose: '__compose',
    apply: '__apply',

    // Internal to Compose
    uri: 'src',
    reference: 'ref',

    childPosition: '__childposition',

    attribute: 'escomponent',
    options: '__options',

    source: '__source',
    path: '__path',

    animate: '__animate',
    states: '__states',

    editor: '__editor',

    original: '__original',

    resize: '__onresize',    
}