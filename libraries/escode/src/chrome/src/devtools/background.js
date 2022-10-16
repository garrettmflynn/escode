console.log(`%cESCode Extension: %cBackground script has been injected!`, `font-weight: bold`, `font-weight: normal`)

console.log('[ESCode Extension]:', globalThis.location, globalThis.ESMonitorState, window.ESMonitorState)

const message = (window.ESMonitorState) ? `Found global ES Monitor state!` : `No global ES Monitor state found...`
console.log(`%cESCode Extension: %c${message}`, `font-weight: bold`, `font-weight: normal`)


let components = []
document.body.querySelectorAll('[__isescomponent]').forEach(o => {
    if (o.esComponent) components.push(o.esComponent)
})

const secondMessage = (components.length) ? `Found ES Components on this page's DOM elements!` : `No ES Components found...`

console.log(`%cESCode Extension: %c${secondMessage}`, `font-weight: bold`, `font-weight: normal`)

