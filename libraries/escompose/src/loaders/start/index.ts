import { ESComponent } from "../../../../esc/esc"
import { esSourceKey, specialKeys } from "../../../../esc/standards"

export const name = 'start'

export const required = true

export const properties = {
    dependents: [
        specialKeys.source, // Activates this from the composition
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
    esc[specialKeys.isGraphScript].start.add(() => start(esc))
}

const set = (esm, value) => esm[specialKeys.isGraphScript].start.value = value

function start (
    esc: ESComponent, 
    callbacks: Function[] = [],
    asyncCallback?: Function
) {

    // Ensure asynchronous loading
    let output;
    if (esc[specialKeys.isGraphScript].options.await) {
        output = asyncConnect.call(esc, async () => {
            if (asyncCallback) await asyncCallback() // Callback when then entire object is ready
            connect.call(esc, callbacks)
            set(esc, true)
        })
        set(esc, output)
    } 
    
    // Default to attempted synchronous loading
    else {
        asyncConnect.call(esc, asyncCallback)
        output = connect.call(esc, callbacks)
        set(esc, true)
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

    // Run Callbacks (e.g. start animations)
    callbacks.forEach(f => f.call(this))

    return this
}