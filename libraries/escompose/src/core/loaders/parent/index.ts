import { ESComponent } from "../../../../../esc"
import { specialKeys } from "../../../../../esc/standards"
import pathLoader from "./path"

export const name = 'parent'

export const required = true

export const properties = {
    dependencies: [
        specialKeys.isGraphScript,
    ],
    dependents: [] // Creates path
}

const parentLoader = (esc, toApply, options) => {

    const configuration = esc[specialKeys.isGraphScript]

    configuration.parent = {
        callbacks: [],
        add: function (callback) {
            this.callbacks.push(callback)
        },
        get: () => {
            return parent
        }
    }

    const existingParent = esc[specialKeys.parent] ?? toApply[specialKeys.parent]

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

            if (parent?.[specialKeys.isGraphScript]) {
                const name = configuration.name
                if (parent[name]) console.error('OVERWRITING EXISTING PROPERTY ON PARENT!')
                parent[name] = esc // Add...
                parent.__.components.set(name, esc) // Add...
            }

            configuration.parent.callbacks.forEach(callback => callback.call(esc, newParent))

            // Update path
            pathLoader(esc, undefined, options) // update path

            // if (v instanceof HTMLElement) {
            
            // Signal disconnection (which isn't simply being a root Component)
            if (disconnecting) {
                esc[specialKeys.isGraphScript].stop.run() // Try running start
            }
            
            // Signal Connection
            else if (parent) { 
                const isConnected = esc[`__${specialKeys.connected}`]
                const toConnect = isConnected instanceof Function
                esc[specialKeys.isGraphScript].start.run() // Try running start
                if (toConnect) isConnected()
            }
            // }


            // configuration.graph
        }
    })    

    pathLoader(esc, undefined, options) // update path

}


export default parentLoader