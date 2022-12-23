import { ESComponent } from "../../../../spec"
import { specialKeys } from "../../../../spec/standards"
import pathLoader from "./path"

export const name = 'parent'

export const required = true

export const properties = {
    dependencies: [
        specialKeys.isGraphScript,
    ],
    dependents: [] // Creates path
}

const parentLoader = (esc, options) => {

    const configuration = esc[specialKeys.isGraphScript]

    configuration.parent = {
        callbacks: [],
        add: function (callback) {
            this.callbacks.push(callback)
        },
        get: () => {
            return parent
        },
        start: (force = false) => {
            if (
                force || 
                parent[specialKeys.isGraphScript]?.start?.value === true
            ) {
                const isConnected = configuration.connected
                const toConnect = isConnected instanceof Function    
                esc[specialKeys.isGraphScript].start.run() // Run start if the parent already has...
                if (toConnect) isConnected() // Signal connection to a root component
            }
        }
    }

    const existingParent = esc[specialKeys.parent] //?? overrides[specialKeys.parent]

    let parent = existingParent as ESComponent
    Object.defineProperty(esc, specialKeys.parent, {
        get: () => {
            return configuration.parent.get()
        },
        set: (newParent) => {

            const disconnecting = parent && !newParent

            if (parent?.[specialKeys.isGraphScript]) {
                const name = configuration.name
                delete parent[name] // Delete...
                parent.__.components.delete(name) // Delete...
            }

            parent = newParent

            const parentConfiguration = parent?.[specialKeys.isGraphScript]
            if (parentConfiguration) {
                const name = configuration.name
                if (parent[name]) console.error('OVERWRITING EXISTING PROPERTY ON PARENT!')
                parent[name] = esc // Add...
                parent.__.components.set(name, esc) // Add...
            }

            configuration.parent.callbacks.forEach(callback => callback.call(esc, newParent))

            pathLoader(esc, options) // update path
            
            // Signal disconnection (which isn't simply being a root Component)
            if (disconnecting) esc[specialKeys.isGraphScript].stop.run() // Try stopping the node
            
            // Attempt to Signal Connection and Start the Node
            else if (parent) configuration.parent.start()
        }
    })    

    pathLoader(esc, options) // update path

}


export default parentLoader