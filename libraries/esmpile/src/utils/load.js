export const script = async (uri) => {
    return await new Promise(((resolve, reject) => {

        const script = document.createElement('script')

        let r = false
        script.onload = script.onreadystatechange = function () {
            if (!r && (!this.readyState || this.readyState == 'complete')) {
                r = true
                resolve(window)
            }
        }

        script.onerror = reject

        script.src = uri;
        document.body.insertAdjacentElement('beforeend', script)
    }))
}
