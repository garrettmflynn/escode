export const value = (name, value, object) => {
    Object.defineProperty(object, name, {
        value,
        writable: false,
        configurable: false,
        enumerable: false
    })
}