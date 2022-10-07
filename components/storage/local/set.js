export default (value) => {
    const key = 'todos'
    console.log('Setting! (key is hardcoded)', key, value)
    localStorage.setItem(key, JSON.stringify(value))
}