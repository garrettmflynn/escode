export default (base, properties) => {
    const copy = Object.assign({}, base)
    return Object.assign(copy, properties)
}