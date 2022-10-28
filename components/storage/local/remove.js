export default (key) => {

    if (!key) localStorage.clear()
    else localStorage.removeItem(key)

    return null
}