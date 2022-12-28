export default (value, key) => {
    localStorage.setItem(key, JSON.stringify(value))
}