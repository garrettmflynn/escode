export default (key) => {
    console.log('Removing', key)
    if (!key) localStorage.clear()
    else localStorage.removeItem(key)
}