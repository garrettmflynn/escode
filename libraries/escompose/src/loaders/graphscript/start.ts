
import * as standards from '../../../../esc/standards';
import * as define from '../../utils/define';

const set = (esm, keys, value, writable=true) => {
    Object.defineProperty(esm, `__${keys.started}`, { value, writable, configurable: false, enumerable: false })
}

export default function (keys, callbacks, asyncCallback?: Function) {

    // Ensure asynchronous loading
    let output;
    if (this[keys.options].await) {
        output = asyncConnect.call(this, keys, async () => {
            if (asyncCallback) await asyncCallback() // Callback when then entire object is ready
            connect.call(this, keys, callbacks)
            set(this, keys, true, false)
        })
        set(this, keys, output)
    } 
    
    // Default to attempted synchronous loading
    else {
        asyncConnect.call(this, keys, asyncCallback)
        output = connect.call(this, keys, callbacks)
        set(this, keys, true, false)
    }

    return output
}

async function asyncConnect (keys, onReadyCallback) {

    await this[keys.connected]

    this[keys.states].connected = true

    const boundEditorsKey = `__bound${keys.editor}s`
    const boundEditors = this[boundEditorsKey]
    if (boundEditors) boundEditors.forEach(editor => editor.setComponent(this)) // set after all children have been set

    // Initialize Nested Components (and wait for them to be done)
    for (let name in this[keys.hierarchy]) {
        let component = this[keys.hierarchy][name]
        const promise = component[keys.promise]
        if (promise && typeof promise.then === 'function' ) component = this[keys.hierarchy][name] = await promise // Wait for the component to be ready
        const init = component[keys.start]
        if (typeof init === 'function') await init()
        else console.error(`Could not start component ${name} because it does not have a __onconnected function`)
    }

    this[`__${keys.resolved}`]() // Tell other programs that the component is resolved

    if (onReadyCallback) await onReadyCallback()


    return this
}

function connect (keys, callbacks: Function[] = []) {

    const privateEditorKey = `__${keys.editor}`

    // ------------------ Retroactively set __editor editor on children of the focus element -----------------
    const __editor = this[keys.parent]?.[privateEditorKey]
    if (__editor) define.value(privateEditorKey, __editor, this)

    // ------------------ Register Sources (from esmpile) -----------------
    let source = this[standards.esSourceKey]
    if (source) {
        if (typeof source === 'function') source = this[keys.source] = source()
        delete this[standards.esSourceKey]
        const path = this[keys.path]
        if (this[privateEditorKey]) this[privateEditorKey].addFile(path, source)
    }

    // Call After Children + Before Running (...TODO: Is this right?)
    const context = this[keys.proxy] ?? this

    if (this[keys.states].initial.start) this[keys.states].initial.start.call(context) // Start callback defined by the user

    // Run Callbacks (e.g. start animations)
    callbacks.forEach(f => f.call(this))

    return this
}