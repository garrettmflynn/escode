const animations = {}

export default function animate(keys) {

    const key = keys.animate ?? 'animate'
    
    if (this[key]) {
        let original = this[key]

        const id = Math.random()
        const interval = (typeof original === 'number') ? original : 'global'

        if (!animations[interval]) {
        
            const info = animations[interval] = {objects: {[id]: this}} as any

            const objects = info.objects
            const runFuncs = () => {
                for (let key in objects) objects[key].default()
            }

            // Global Animation Frames
            if (interval === 'global') {
                const callback = () => {
                    runFuncs()
                    info.id = window.requestAnimationFrame(callback)
                }

                callback()

                animations[interval].stop = () => {
                    window.cancelAnimationFrame(info.id)
                    info.cancel = true
                }
            }
            // Set Interval
            else {
                runFuncs() // run initially
                info.id = setInterval(() => runFuncs(), 1000/interval)
                animations[interval].stop = () => clearInterval(info.id)
            } 
        } 
        
        // Add to Objects
        else {
            this.default() // run initially
            animations[interval].objects[id] = this
        }


        this[key] = {
            id,
            original,
            stop: () => {
                delete animations[interval].objects[id]
                this[key] = original // Replace with original function
                if (Object.keys(animations[interval].objects).length === 0) {
                    animations[interval].stop()
                    delete animations[interval]
                }
            }
        }
    }
}