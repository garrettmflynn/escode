export const keySeparator = '.'

export const defaultPath = 'default'

export const esSourceKey = '__esmpileSourceBundle'

export const specialKeys = {

    start: 'esConnected', // asked to start
    stop: 'esDisconnected',
    connected: 'esReady', // wait until connected

    hierarchy: 'esDOM',
    element: 'esElement',
    webcomponents: 'esComponents',
    attributes: 'esAttributes',

    listeners: {
        value: 'esListeners',
        branch: 'esBranch',
        bind: 'esBind',
        trigger: 'esTrigger',
        format: 'esFormat',
    },

    trigger: 'esTrigger',
    compose: 'esCompose',

    uri: 'esURI',
    reference: 'esReference',

    childPosition: 'esChildPosition',

    attribute: '__isescomponent',

    parent: 'esParent',
    component: 'esComponent',

    source: 'esSource',
    path: '__isESComponent',

    animate: 'esAnimate',
    options: '__esOptions',
    states: '__esStates',

    promise: '__esComponentPromise',
    proxy: '__esProxy',
    editor: 'esCode',

    flow: '__esManager',

    original: 'esOriginal',

    resize: 'esOnResize',    
}