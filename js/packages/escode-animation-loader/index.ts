import { specialKeys } from "../../../spec/properties"
import { isNode } from "../common/globals"

const animations = {}


export const name = 'animation'

const key = specialKeys.animate

export const properties = {
    dependents: [specialKeys.animate]
}

export default function animate(esc) {

    
    if (esc[key]) {

        let original = esc[key]

        const id = Math.random()
        const interval = (typeof original === 'number') ? original : (isNode) ? 60 : 'global'

        let startFunction;

        if (!animations[interval]) {
        
            const info = animations[interval] = {objects: {[id]: esc}} as any

            const objects = info.objects
            const runFuncs = () => {
                for (let key in objects) {
                    const node = objects[key]
                    if (node[specialKeys.operator]) node[specialKeys.operator]()
                    else if (node[specialKeys.default]) node[specialKeys.default]()
                }
            }

            // Global Animation Frames
            if (interval === 'global') {
                const callback = () => {
                    runFuncs()
                    info.id = globalThis.requestAnimationFrame(callback)
                }

                startFunction = callback

                animations[interval].stop = () => {
                    globalThis.cancelAnimationFrame(info.id)
                    info.cancel = true
                }
            }
            // Set Interval
            else {
                startFunction = () => {
                    runFuncs() // run initially
                    info.id = setInterval(() => runFuncs(), 1000/interval)
                }

                animations[interval].stop = () => clearInterval(info.id)
            } 
        } 
        
        // Add to Objects
        else {
            startFunction = () => {
                esc.default() // run initially
                animations[interval].objects[id] = esc
            }
        }

        esc[specialKeys.root].start.add(startFunction)

        // Stop Animation
        esc[specialKeys.root].stop.add(() => {
            delete animations[interval].objects[id]
            esc[key] = original // Replace with original function
            if (Object.keys(animations[interval].objects).length === 0) {
                animations[interval].stop()
                delete animations[interval]
            }
        })
    }
}