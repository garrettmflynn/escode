
export default function (keys) {

    if ( this[keys.animate] && typeof this[keys.animate].stop === 'function') this[keys.animate].stop()

    // Clear all listeners below this node
    this[keys.flow].clear()

    // Clear all listeners above this node that reference it
    let target = this
    while (target[keys.parent].hasAttribute(keys.attribute)) {
        const res = target[keys.element][keys.parent]?.[keys.component]
        if (res) {
            target = res
            if (target && target[keys.flow]) target[keys.flow].clear(this[keys.path])
        } else break
    }

    if (this[keys.hierarchy]) {
        for (let name in this[keys.hierarchy]) {
            const component = this[keys.hierarchy][name]
            if (typeof component[keys.stop] === 'function') component[keys.stop]()
            else console.warn('Could not disconnect component because it does not have an esDisconnected function', name, this.esDOM)
        }
    }

    // Remove Element
    if ( this[keys.element] instanceof Element) {
        this[keys.element].remove();
        if(this[keys.remove]) {
            const context = this[keys.proxy] ?? this
            this[keys.remove].call(context); 
        }
    }

    // Remove code editor
    const privateEditorKey = `__${keys.editor}`
    if (this[privateEditorKey]) this[privateEditorKey].remove() 

    const context = this[keys.proxy] ?? this

    const ogStop = this[keys.states].initial.stop
    if (ogStop) ogStop.call(context)

    // Replace Updated Keywords with Original Values
    this[keys.start] = this[keys.states].initial.start
    this[keys.stop] =ogStop
    return this
}