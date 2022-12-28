import { esSourceKey, specialKeys } from "../../../spec/properties"
import ESComponent from "../../esc.spec"

export const name = 'start'

export const required = true

export const properties = {
    dependents: [
        specialKeys.source, // Activates this from the composition
    ],
    dependencies: [
        esSourceKey,
        specialKeys.root,
        specialKeys.editor,
        specialKeys.parent,
        specialKeys.proxy,
        // specialKeys.connected,
        specialKeys.promise,
        specialKeys.resolved,
    ],
}

export default (esc) => {
    esc[specialKeys.root].start.add(() => start(esc))
}

const set = (esm, value) => esm[specialKeys.root].start.value = value

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


    const configuration = this[specialKeys.root]
    // await this[specialKeys.connected] // TODO: If you want this to be supported, then the parent loader must be more reliable...
    configuration.connected = true // Ensure the configuration shows a connection

    // Set resolved component on any editors
    const boundEditors = configuration.editor?.bound
    if (boundEditors) {
        boundEditors.forEach(editor => editor.setComponent(this)) // set after all children have been set
    }

    // Run additional callback
    if (onReadyCallback) await onReadyCallback()

    return this
}

function connect (callbacks: Function[] = []) {

    // ------------------ Retroactively set __editor editor on children of the focus element -----------------
    const configuration = this[specialKeys.root]
    const parentConfiguration = this[specialKeys.parent]?.[specialKeys.root]
    const __editor = parentConfiguration?.editor.value
    if (__editor) configuration.editor.value = __editor // Set same editor on children

    // ------------------ Register Sources (from esmpile) -----------------
    let source = this[esSourceKey]
    if (source) {
        if (typeof source === 'function') source = this[specialKeys.source] = source()
        delete this[esSourceKey]
        const path = this[specialKeys.root].path
        if (__editor) __editor.addFile(path, source)
    }

    // Run Callbacks (e.g. start animations)
    callbacks.forEach(f => f.call(this))

    return this
}