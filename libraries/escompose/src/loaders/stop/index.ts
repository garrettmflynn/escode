import { specialKeys } from "../../../../esc/standards"


export const name = 'stop'

export const required = true

export const properties = {
    dependencies: [
        specialKeys.isGraphScript,
        specialKeys.animate,
        specialKeys.flow,
        specialKeys.parent,
        specialKeys.element,
        specialKeys.hierarchy,
        specialKeys.proxy,
    ],
    dependents: []
}
export default (esc) => {
    esc[specialKeys.isGraphScript].stop.add(() => stop(esc)) // Add this as the final stop callback
}


// TODO: Move this to all the relevant files...
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

    // Remove Element
    if ( esc[specialKeys.element] instanceof Element)  esc[specialKeys.element].remove();

    // Remove code editor
    const privateEditorKey = `${specialKeys.editor}Attached` // TODO: Ensure esc key is standard
    if (esc[privateEditorKey]) esc[privateEditorKey].remove() 

    return esc
}