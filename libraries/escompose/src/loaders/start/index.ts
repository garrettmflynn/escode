import { ESComponent } from "../../../../esc"
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
    asyncConnect.call(esc, asyncCallback)
    let output = connect.call(esc, callbacks)
    set(esc, true)
    return output
}

async function asyncConnect (onReadyCallback) {


    const configuration = this[specialKeys.isGraphScript]
    await this[specialKeys.connected]
    configuration.connected = true // Ensure the configuration shows a connection

    // Set resolved component on any editors
    const boundEditors = configuration.boundEditors
    if (boundEditors) boundEditors.forEach(editor => editor.setComponent(this)) // set after all children have been set

    // Run additional callback
    if (onReadyCallback) await onReadyCallback()

    return this
}

function connect (callbacks: Function[] = []) {

    // ------------------ Retroactively set __editor editor on children of the focus element -----------------
    const configuration = this[specialKeys.isGraphScript]
    const parentConfiguration = this[specialKeys.parent]?.[specialKeys.isGraphScript]
    const __editor = parentConfiguration?.editor
    if (__editor) configuration.editor = __editor

    // ------------------ Register Sources (from esmpile) -----------------
    let source = this[esSourceKey]
    if (source) {
        if (typeof source === 'function') source = this[specialKeys.source] = source()
        delete this[esSourceKey]
        const path = this[specialKeys.isGraphScript].path
        if (configuration.editor) configuration.editor.addFile(path, source)
    }

    // Run Callbacks (e.g. start animations)
    callbacks.forEach(f => f.call(this))

    return this
}