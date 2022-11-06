
const id = 'escode-devtools-injection'

const send = (o) => {
    window.postMessage({ ...o, source: id }, '*');
}


// --------------- Initialize Connection with DevTools Extension ---------------
const echoId = Math.random()
send({ name: 'echo', id: echoId }, '*');


const components = []
const esmonitor = window.ESMonitorState
document.body.querySelectorAll('[escomponent]').forEach(o => {
    if (o.esComponent) components.push(o.esComponent)
})


// --------------------------- Pass State Changes to DevTools ---------------------------
const drill = (o, opts = {}) => {

    const seen = opts.seen ?? {
        values: [],
        resolved: []
    }

    const toFill = opts.toFill ?? []


    const copy = {}

    const initial = seen.values.length === 0

    for (let key in o) {
        let value = o[key]
        const isObj = value && typeof value === 'object' 
        const idx = seen.values.indexOf(value)

        const path = opts.path ? `${opts.path}.${key}` : key
        const usedKey = opts.flatten ? path : key

        if (isObj && idx !== -1) {
            toFill.push({ key: usedKey, parent: copy, idx })
            continue;
        }

        const isElement = value instanceof Element
        const toDrill = isObj && !isElement // No HTML Elements

        seen.values.push(value);

        try {

            if (isElement) throw value;

            const tooDeep = opts.depth ? opts.__depth >= opts.depth : false
            const res = JSON.stringify(value) // Check if stringifiable
            if (value !== undefined && res === undefined) throw res
            if (toDrill && !tooDeep) {
                const update = drill(value, {
                    seen, 
                    toFill,
                    flatten: opts.flatten,
                    path,
                    depth: opts.depth,
                    _depth: opts._depth + 1,
                })

                if (opts.flatten) Object.assign(copy, update)
                else copy[usedKey] = update
            } else {
                copy[usedKey] = value
            }

        } catch {
            let prefix = typeof value
            prefix = prefix[0].toUpperCase() + prefix.slice(1)
            const suffix = value?.constructor?.name ?? value?.prototype?.name
            copy[usedKey] = `${(suffix && suffix !== prefix) ? `${prefix}[${suffix}]` : prefix}`
        }

        seen.resolved.push(copy[usedKey]);
    }


    if (initial) {
        toFill.forEach(({ key, parent, idx }) => parent[key] = seen.resolved[idx])
    }
    
    return copy
}


if (esmonitor) {
    

    send({ name: 'storage.update', value: {  compatibleSiteHistory: window.location.href }}, '*');

    const ogCallback = esmonitor.callback

    esmonitor.info = {performance: true} // Force getting performance info

    esmonitor.callback = (path, info, update) => {

            if (ogCallback) ogCallback(path, info, update)

            const stateInfo = {
                path,
                info,
                update
            }

            try {
                const state = drill(stateInfo, {depth: 2}) // ensure states can be passed
                send({ state }, '*');
            } catch (e) {
                console.warn('[ESCode]: Could not pass state', stateInfo, e)
            }
        }
    }
// --------------------------- Clear DevTools Panel ---------------------------
window.addEventListener('beforeunload', () => {
    send({ clear: true }, '*');
})



const relayId = 'escode-content-script-relay'

const validIds = [id, relayId]

const init = () => {
    try {
        const esStates = esmonitor.state
        const states = drill(esStates) // ensure states can be passed
        send({ states }, '*');
    } catch (e) {
        console.warn('[ESCode]: Could not initialize states', esmonitor.state, e)
    }
}

window.addEventListener('message', function(event) {

    const message = event.data;
    if (event.source !== window) return;  // Only accept messages from the same frame
    if (typeof message !== 'object' || message === null || !validIds.includes(message.source)) return; // Only accept messages that we know are ours

    // ------------------ Initialize State Changes on Request ------------------

    if (esmonitor) {
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
  });


  document.addEventListener('contextmenu', function(ev) {
    const target = ev.target
    const isESComponent = target.hasAttribute('escomponent')
    if (isESComponent) {
        send({ focus: target.esComponent.__isESComponent }, '*');
    }

    }, false);