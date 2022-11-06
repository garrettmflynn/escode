(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[4],{

/***/ 6:
/***/ (function(module, exports) {


const id = 'escode-devtools-injection'


// --------------- Initialize Connection with DevTools Extension ---------------
const echoId = Math.random()
window.postMessage({ name: 'echo', source: id, id: echoId }, '*');


const components = []
const state = window.ESMonitorState
document.body.querySelectorAll('[escomponent]').forEach(o => {
    if (o.esComponent) components.push(o.esComponent)
})

// --------------------------- Clear DevTools Panel ---------------------------
window.addEventListener('beforeunload', () => {
    window.postMessage({
        clear: true,
        source: id
    }, '*');
})

// --------------------------- Pass State Changes to DevTools ---------------------------

if (state) {
    const inspectable = state.__esInspectable

    if (inspectable) {

        window.postMessage({ name: 'storage.update', value: { compatibleSiteHistory: window.location.href }, source: id }, '*');

        const ogCallback = inspectable.options.callback

        inspectable.options.callback = (path, info, update) => {

            if (ogCallback) ogCallback(path, info, update)

            const stateInfo = {
                path,
                info,
                update
            }

            try {
                const state = JSON.parse(JSON.stringify(stateInfo))
                window.postMessage({ state, source: id }, '*');
            } catch (e) {
                console.warn('[ESCode]: Could not pass state', state, e)
            }
        }
    }

    const relayId = 'escode-content-script-relay'

    const validIds = [id, relayId]

    const init = () => {
        try {
            const states = inspectable.state
            window.postMessage({ states, source: id }, '*');
        } catch (e) {
            console.warn('[ESCode]: Could not initialize states', inspectable.state, e)
        }
    }

    window.addEventListener('message', function (event) {

        const message = event.data;
        if (event.source !== window) return;  // Only accept messages from the same frame
        if (typeof message !== 'object' || message === null || !validIds.includes(message.source)) return; // Only accept messages that we know are ours

        // ------------------ Initialize State Changes on Request ------------------

        if (inspectable) {
            const name = message.name
            if (name === 'init') {
                init()
            } else if (name === 'echo') {
                if (message.id === echoId) {
                    console.log('[ESCode]: DevTools Extension Connected')
                    init() // Initialize if already connected
                }
            }
        }
    })
}

/***/ })

},[[6,0]]]);