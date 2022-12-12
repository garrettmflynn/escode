import { fromInspectable, isProxy } from "../globals"

function define(key, registerAsNewKey: boolean) {

    const inspectable = this

    const target = this.target

    if (!this.parent) {
        let value = target[key]

        // Intercept functions
        if (typeof value === 'function') {
            target[key] = async (...args) => await this.proxy[key]({ [fromInspectable]: true, value }, ...args)
        } 

        // Basic Getter / Setter for Original Input
        else {

            try {
                Object.defineProperty(target, key, {
                    get: () => value,

                    // Support setting from inspectable too
                    set: function (val) {
                        value = val
                        inspectable.proxy[key] = {[isProxy]: this[isProxy], [fromInspectable]: true, value: val}
                    },
                    enumerable: true,
                    configurable: true // TODO: Ensure that you are removing later...
                })

            } catch (e) {
                console.error(`Could not reassign ${key} to a top-level setter...`)
            }
        }
    }

    if (registerAsNewKey) this.newKeys.add(key)

    // Create More Proxies Inside
    this.create(key, target, undefined, true)
}

export default define;