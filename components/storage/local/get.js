export default (key) => {
    let item = localStorage.getItem(key)
    try {
        item = JSON.parse(item)
    } catch (e) {
        console.log('Is a string..', e)
    }
    return (item === null) ? undefined : item
}