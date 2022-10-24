
export let url = undefined
export let name = undefined
export let popup = undefined

export function esInit() {

    if (!this.popup?.closed && this.name && this.url) {

        this.popup = globalThis.open(this.url, this.name, `popup`);
    
        const timer = globalThis.setInterval(() => {
            
            if (this.popup.closed !== false) { // !== is required for compatibility with Opera
                globalThis.clearInterval(timer);
                this.esDelete()
            }
        }, 200);
    
        globalThis.addEventListener('message', (ev) => {
            if (this.name === ev.source.name) this.onmessage(ev)
        })

        globalThis.addEventListener('beforeunload', this.popup.close)

    }

}

export function esDelete() {
    if (this.popup) this.popup.close()
}

export function onmessage(ev){
    console.log(`message from ${ev.source.name}`, ev.data)
    return ev.data
}

export default function (message) {

    // TODO: Allow for asynchronously waiting for the specific response from this update
    if (message) {
        this.popup.postMessage({ message, for: this.name })
    }

}