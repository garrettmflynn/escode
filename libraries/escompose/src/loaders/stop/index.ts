import { specialKeys } from "../../../../esc/standards"

export const properties = {
    dependencies: [
        specialKeys.isGraphScript,
        specialKeys.animate,
        specialKeys.flow,
        specialKeys.parent,
        specialKeys.element,
        specialKeys.hierarchy,
        specialKeys.proxy,
        specialKeys.start,
        specialKeys.remove,
    ],
    dependents: [specialKeys.stop]
}
export default (esc) => {
    esc[specialKeys.stop] = () => stop(esc)
}


function stop(esc) {

    if ( esc[specialKeys.animate] && typeof esc[specialKeys.animate].stop === 'function') esc[specialKeys.animate].stop()

    // Clear all listeners below esc node
    esc[specialKeys.flow].clear()

    // Clear all listeners above esc node that reference it
    const path = esc[specialKeys.isGraphScript].path
    let target = esc
    while (target[specialKeys.parent][specialKeys.isGraphScript] !== undefined) {
        const res = target[specialKeys.element][specialKeys.parent] // parent is a component
        if (res) {
            target = res
            if (target && target[specialKeys.flow]) target[specialKeys.flow].clear(path)
        } else break
    }

    if (esc[specialKeys.hierarchy]) {
        for (let name in esc[specialKeys.hierarchy]) {
            const component = esc[specialKeys.hierarchy][name]
            if (typeof component[specialKeys.stop] === 'function') component[specialKeys.stop]()
            else console.warn('Could not disconnect component because it does not have an __ondisconnected function', name, esc.__children)
        }
    }

    // Remove Element
    if ( esc[specialKeys.element] instanceof Element) {
        esc[specialKeys.element].remove();
        if(esc[specialKeys.remove]) {
            const context = esc[specialKeys.proxy] ?? esc
            esc[specialKeys.remove].call(context); 
        }
    }

    // Remove code editor
    const privateEditorKey = `${specialKeys.editor}Attached` // TODO: Ensure esc key is standard
    if (esc[privateEditorKey]) esc[privateEditorKey].remove() 

    const context = esc[specialKeys.proxy] ?? esc

    const states = esc[specialKeys.isGraphScript].states
    const ogStop = states.initial.stop
    if (ogStop) ogStop.call(context)

    // Replace Updated Keywords with Original Values
    esc[specialKeys.start] = states.initial.start
    esc[specialKeys.stop] = ogStop
    return esc
}