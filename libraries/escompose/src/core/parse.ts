import { Options } from "../../../common/types"
import { keySeparator, specialKeys } from "../../../esc/standards"
import Monitor from "../../../esmonitor/src"
import { deep as deepClone } from "../../../common/clone"
import { AnyClass, ConfigInput, FinalConfig } from "../types"

// TODO: Completely separate here...
import compose from "../loaders/compose"
import { toReturn } from "./symbols"
import { isNode } from "../globals"
import { all } from "../../../common/properties"


const isNativeClass= (o) => typeof o === 'function' && o.hasOwnProperty('prototype') && !o.hasOwnProperty('arguments')

// This function accepts pre-parsed configuration objects and returns a final configuration object
export default function parse(config: ConfigInput, toApply: any = {}, options: Partial<Options> = {}) {

    if (!isNode) {
        if (config instanceof NodeList) config = Array.from(config)  // DOM NodeList Support (e.g. from querySelectorAll): Converts to an array of configurations
    }


    if ( typeof config === 'string') config =  { [specialKeys.apply]: config } // String Support: Transform string so that it is compiled from source

    // Function Support: Transform function so that it becomes an object
    else if ( typeof config === 'function') {
        if (isNativeClass(config)) config = new (config as AnyClass)(toApply, options) // Create a class
        else {
            delete (config as any).__ // remove a triggering __ property from the function
            config = { [specialKeys.default]: config } // Apply as a default function
        }
    }

    // Apply Component to the Element
    else if (!isNode && config instanceof Element) {
        const component = config[specialKeys.component]

        // Directly Merge into existing element + component pairs (TO FINISH)
        if (component) {

            toApply = deepClone(toApply) // Clone the applied object to prevent mutation

            // We cannot handle the compose and apply keywords the same way—so we will approximate here.
            const shouldHaveComposed = toApply.__compose
            const shouldHaveApplied = toApply.__apply
            delete toApply.__compose
            delete toApply.__apply

            if (shouldHaveComposed) {
                console.warn('Cannot compose a component onto an element that already has a component. Merging with the base object instead...')
                toApply = Object.assign(shouldHaveComposed, toApply)
            }

            if (shouldHaveApplied) {
                console.warn('Cannot apply a component onto an element that already has a component. Applying to the base object instead...')
                toApply = Object.assign(toApply, shouldHaveApplied)
            }

            compose(component, toApply, options, true)  // Complete a reverse composition to apply to an existing component

            return {[toReturn]: component} // shortcut to stop and return the existing component
        }
        // Create new component with element as the base
        else {
            config = { [specialKeys.element]: config } // Compile element to object
        }
    }

    // Bulk Operations
    else if (Array.isArray(config)) return config // return array to be handled

    // Failed Resolution
    else if ( typeof config === 'object') {
        config = (options.clone !== false ? deepClone(config) : config)
    }

    else throw new Error(`Invalid configuration type: ${ typeof config }. Expected object or string.`)   
    
    // -------------- Assign Standard Properties to the Component Object --------------         
    return config as FinalConfig
}


 // -------------- Create Complete Options Object --------------         
export const parseOptions = (options: Partial<Options>) => {
 const copy = deepClone(options)
 let monitor;
 if (copy.monitor instanceof Monitor) {
     monitor = copy.monitor
     copy.keySeparator = monitor.keySeparator // Inherit key separator
 } else {
     if (!copy.monitor) copy.monitor = {}
     if (!copy.monitor.keySeparator) {
         if (!copy.keySeparator) copy.keySeparator = keySeparator // Ensure key separator is defined
         copy.monitor.keySeparator = copy.keySeparator
     }
     copy.monitor = new Monitor(copy.monitor)
 }

 return copy as Options
}