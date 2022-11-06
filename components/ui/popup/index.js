
export const url = undefined
export const name = undefined
export const popup = undefined
export const ready = undefined

export function onMessage(ev) {
    if (this.name === ev.source.name) this.onmessage(ev)
}

export function onBeforeUnload () {
    this.popup.close()
}

export function esConnected() {

    if (!this.popup?.closed && this.name && this.url) {

        this.popup = globalThis.open(this.url, this.name, `popup`);

        const timer = globalThis.setInterval(() => {
            
            if (this.popup && this.popup.closed !== false) { // !== is required for compatibility with Opera
                globalThis.clearInterval(timer);
                this.esDisconnected()
            }
        }, 200);
    
        globalThis.addEventListener('message', this.onMessage)
        globalThis.addEventListener('beforeunload', this.onBeforeUnload)
    }
}

export function esDisconnected() {
    if (this.popup) this.popup.close()
    globalThis.removeEventListener('message', this.onMessage)
    globalThis.removeEventListener('onbeforeunload', this.onBeforeUnload)
}

export function onReady () {
    this.ready = true
    this.buffer.forEach(msg => this.popup.postMessage(msg))
    this.buffer = []
}

export function onmessage(ev){
    if (ev.data.ready) this.onReady()
    return ev.data
}

export const buffer = []

export default function (message) {

    // TODO: Allow for asynchronously waiting for the specific response from this update
    if (message) {
        const msg = { message, for: this.name }
        if (this.ready) this.popup.postMessage(msg)
        else this.buffer.push(msg)
    }

}