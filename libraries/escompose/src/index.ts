import Monitor from "../../esmonitor/src"
import { deep as deepClone } from "../../common/clone.js"
import * as standards from "../../esc/standards"
import { Options } from "../../common/types"
import * as utils from "./utils"
import FlowManager from "../../drafts/edgelord/index"

import handleHierarchy from './create/helpers/hierarchy'


export const create = (config, toMerge:any = {}, options: Partial<Options> = {}) => {

    // -------------- Create Complete Options Object --------------

    // Reject mobile devices
    const parent = config.__parent ?? toMerge.__parent ?? document.body
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){

        const div = document.createElement('div')
        const p1 = document.createElement('p')
        p1.innerHTML = '<b>Sorry, this app is not supported on mobile devices.</b>'
        div.appendChild(p1)

        const p2 = document.createElement('p')
        p2.innerText = 'Please use a desktop or laptop computer to view this app.'
        div.appendChild(p2)

        div.style = 'background: black; color: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;'

        parent.appendChild(div)

    }
               

    options = deepClone(options)
    let monitor;
    if (options.monitor instanceof Monitor) {
        monitor = options.monitor
        options.keySeparator = monitor.options.keySeparator // Inherit key separator
    } else {
        if (!options.monitor) options.monitor = {}
        if (!options.monitor.keySeparator) {
            if (!options.keySeparator) options.keySeparator = standards.keySeparator // Ensure key separator is defined
            options.monitor.keySeparator = options.keySeparator
        }
        options.monitor = new Monitor(options.monitor)
    }

    if (options.clone) config = deepClone(config) // NOTE: If this doesn't happen, the reference will be modified by the create function


    // Always fall back to __children
    options.monitor.options.fallbacks = [standards.specialKeys.hierarchy]

    const fullOptions = options as Options

        let instancePromiseOrObject;


        const onConnected = (instance) => {

            const noParent = !instance[standards.specialKeys.parent] // Do not wait if no parent is given (since the app is only ready when placed in the DOM)
            
            // Just return instance synchronously
            if (noParent) return instance

            // Ensure a promise output
            // else return new Promise(resolve => {
            //     return utils.resolve(instance[standards.specialKeys.start](), resolve)
            // })

            // Return synchronously unless the user requests a promise
            else {
                const startRes = instance[standards.specialKeys.start]()
                return utils.resolve(startRes, resolve)
            }

        }


        if (options.nested?.parent && options.nested?.name){
            // TODO: Figure out how to pass the path for real...
            instancePromiseOrObject = handleHierarchy(config, options.nested.name, toMerge, options.nested.parent, undefined, fullOptions)
        } else {

            const id = Symbol('root')

            let listeners = {}
            instancePromiseOrObject = handleHierarchy(config, id, toMerge, undefined, undefined, fullOptions, {
                [id]: (instance) => {
                    (options.monitor as Monitor).set(id, instance, fullOptions.listeners) // Setting root instance
                },
                onInstanceCreated: (absolutePath, instance) => {

                    // Set listeners as soon as possible
                    if (fullOptions.listen !== false) {
                        const to = instance[standards.specialKeys.listeners.value] ?? {}  // Uses to —> from syntax | Always set
                        const manager = listeners[absolutePath] = new FlowManager(to, absolutePath, {
                            id, instance, monitor: fullOptions.monitor, options: fullOptions
                        }) // Uses from —> to syntax
                        instance[standards.specialKeys.listeners.value] = to // Replace with listeners assigned (in case of unassigned)

                        
                        // Declaring manager
                        Object.defineProperty(instance, standards.specialKeys.flow, {
                            value: manager,
                            enumerable: false,
                            writable: false
                        })

                        // -------- Trigger Execution when Ready --------
                        if (standards.specialKeys.trigger in instance) {
                            if (!Array.isArray(instance[standards.specialKeys.trigger])) instance[standards.specialKeys.trigger] = []
                            const args = instance[standards.specialKeys.trigger]
                            manager.onStart(() => instance.default(...args))
                            delete instance[standards.specialKeys.trigger]
                        }

                    }
                },
                onInstanceReady: (absolutePath) => {
                    listeners[absolutePath].start()
                }
            })
        }

        const res = utils.resolve(instancePromiseOrObject, onConnected)
        return res
}

export default create

export const clone = deepClone
export const resolve = utils.resolve