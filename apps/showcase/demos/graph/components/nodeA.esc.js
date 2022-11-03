export const x = 1
export const y = 2
export function jump () {

    const id = this._node ? 'escXgs' : 'esc'
    const escDiv = document.getElementById(id)
    escDiv.innerHTML += `<li>jump!</li>`

    return 'jumped!'; 
}