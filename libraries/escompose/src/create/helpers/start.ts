
import * as standards from '../../../../common/standards';
import * as define from '../define';

export default function (keys, callbacks, asyncCallback?: Function) {

    // Ensure asynchronous loading
    if (this[keys.options].await) {
        return asyncConnect.call(this, keys, async () => {
            if (asyncCallback) await asyncCallback() // Callback when then entire object is ready
            connect.call(this, keys, callbacks)
        })
    } 
    
    // Default to attempted synchronous loading
    else {
        const toRun = asyncConnect.call(this, asyncCallback)
        connect.call(this)
        return toRun
    }
}

async function asyncConnect (keys, onReadyCallback) {

    await this[keys.connected]

    this[keys.states].connected = true

    // Initialize Nested Components (and wait for them to be done)
    for (let name in this[keys.hierarchy]) {
        let component = this[keys.hierarchy][name]
        const promise = component[keys.promise]
        if (promise && typeof promise.then === 'function' ) component = this[keys.hierarchy][name] = await promise // Wait for the component to be ready
        const init = component[keys.start]
        if (typeof init === 'function') await init()
        else console.error(`Could not start component ${name} because it does not have an esConnected function`)
    }

    if (onReadyCallback) await onReadyCallback()
}

async function connect (keys, callbacks: Function[] = []) {

    // ------------------ Register Sources (from esmpile) -----------------
    const privateEditorKey = `__${keys.editor}`
    let source = this[standards.esSourceKey]
    if (source) {
        if (typeof source === 'function') source = this[keys.source] = source()
        delete this[standards.esSourceKey]
        const path = this[keys.path]
        if (this[privateEditorKey]) this[privateEditorKey].addFile(path, source)
    }

    // ------------------ Retroactively set esCode editor on children of the focus element -----------------
    const esCode = this[keys.parent]?.[keys.component]?.[privateEditorKey]
    if (esCode) define.value(privateEditorKey, esCode, this)

    // Call After Children + Before Running (...TODO: Is this right?)
    const context = this[keys.proxy] ?? this
    if (this[keys.states].initial.start) this[keys.states].initial.start.call(context)

    // Run as an Animation
    callbacks.forEach(f => f.call(this))

}