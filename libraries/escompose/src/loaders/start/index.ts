import { ESComponent } from "../../../../esc/esc"
import { esSourceKey, specialKeys } from "../../../../esc/standards"

// TODO: Move animate out to its own independent loader
import * as animate from "../animate"


export const name = 'start'

export const properties = {
    dependents: [
        specialKeys.start,
        specialKeys.source, // Activates this from the composition
        specialKeys.started,
        ...animate.properties.dependents
    ],
    dependencies: [
        esSourceKey,
        specialKeys.isGraphScript,
        specialKeys.editor,
        specialKeys.parent,
        specialKeys.proxy,
        specialKeys.connected,
        specialKeys.hierarchy,
        specialKeys.promise,
        specialKeys.resolved,
    ],
}

export default (esc) => {
    esc[specialKeys.start] = () => start(esc, [ animate.default ]) // Add the start function with additiobnal loaders
}

const set = (esm, value, writable=true) => Object.defineProperty(esm, `__${specialKeys.started}`, { value, writable })

// TODO: Ensure you have the right properties
function start (
    esc: ESComponent, 
    callbacks, 
    asyncCallback?: Function
) {

    // Ensure asynchronous loading
    let output;
    if (esc[specialKeys.isGraphScript].options.await) {
        output = asyncConnect.call(esc, async () => {
            if (asyncCallback) await asyncCallback() // Callback when then entire object is ready
            connect.call(esc, callbacks)
            set(esc, true, false)
        })
        set(esc, output)
    } 
    
    // Default to attempted synchronous loading
    else {
        asyncConnect.call(esc, asyncCallback)
        output = connect.call(esc, callbacks)
        set(esc, true, false)
    }

    return output
}

async function asyncConnect (onReadyCallback) {

    await this[specialKeys.connected]

    const states = this[specialKeys.isGraphScript].states
    states.connected = true

    const boundEditorsKey = `__bound${specialKeys.editor}s`
    const boundEditors = this[boundEditorsKey]
    if (boundEditors) boundEditors.forEach(editor => editor.setComponent(this)) // set after all children have been set

    // Initialize Nested Components (and wait for them to be done)
    for (let name in this[specialKeys.hierarchy]) {
        let component = this[specialKeys.hierarchy][name]
        const promise = component[specialKeys.promise]
        if (promise && typeof promise.then === 'function' ) component = this[specialKeys.hierarchy][name] = await promise // Wait for the component to be ready
        const init = component[specialKeys.start]
        if (typeof init === 'function') await init()
        else console.error(`Could not start component ${name} because it does not have a __onconnected function`)
    }

    this[`__${specialKeys.resolved}`]() // Tell other programs that the component is resolved

    if (onReadyCallback) await onReadyCallback()


    return this
}

function connect (callbacks: Function[] = []) {

    const privateEditorKey = `__${specialKeys.editor}`

    // ------------------ Retroactively set __editor editor on children of the focus element -----------------
    const __editor = this[specialKeys.parent]?.[privateEditorKey]
    if (__editor) Object.defineProperty(this, privateEditorKey, { value: __editor })

    // ------------------ Register Sources (from esmpile) -----------------
    let source = this[esSourceKey]
    if (source) {
        if (typeof source === 'function') source = this[specialKeys.source] = source()
        delete this[esSourceKey]
        const path = this[specialKeys.isGraphScript].path
        if (this[privateEditorKey]) this[privateEditorKey].addFile(path, source)
    }

    // Call After Children + Before Running (...TODO: Is this right?)
    const context = this[specialKeys.proxy] ?? this

    const states = this[specialKeys.isGraphScript].states
    if (states.initial.start) states.initial.start.call(context) // Start callback defined by the user

    // Run Callbacks (e.g. start animations)
    callbacks.forEach(f => f.call(this))

    return this
}