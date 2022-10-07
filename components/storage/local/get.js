export default (key='todos') => {
    let item = localStorage.getItem(key)
    try {
        item = JSON.parse(item)
    } catch (e) {
        console.log('Is a string..', e)
    }
    console.log('Got (key is hardcoded...)', key, item)
    return (item === null) ? undefined : item
}