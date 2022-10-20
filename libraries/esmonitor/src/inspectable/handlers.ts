import * as listenerUtils from "../listeners";
import { runCallback } from "../utils";
import { 
    fromInspectable,
    // fromInspectable, 
    isProxy 
} from '../globals'
import Inspectable from ".";

export const functions = (proxy: Inspectable) => {
    return {
        apply: async function (target, thisArg, argumentsList) {
            try {

                let foo = target
                const isFromInspectable = argumentsList[0]?.[fromInspectable]
                if (isFromInspectable) {
                    foo = argumentsList[0].value
                    argumentsList = argumentsList.slice(1)
                }

                let listeners = proxy.listeners.functions
                // Notify of Function Execution
                const pathStr = proxy.path.join(proxy.options.keySeparator)

                const toActivate =  (listeners) ? listeners[pathStr] : undefined
                let output, executionInfo: any = {};

                if (toActivate){
                    executionInfo = await listenerUtils.functionExecution(thisArg, toActivate, foo, argumentsList)
                    output = executionInfo.output
                } 
                
                // Default Behavior
                else {
                    output = await foo.apply(thisArg, argumentsList);
                    executionInfo = proxy?.state?.[pathStr]?.value ?? {}
                }
                
                // Notify with Proxy Callback
                const callback = proxy.options.callback

                runCallback(callback, pathStr, executionInfo, output)

                // Return output to function
                return output

            } catch (e) {
                console.warn(`Cannot run function:`, e, proxy.path, proxy.parent, target, argumentsList);
            }
        }
    };
}

export const objects = (proxy: Inspectable) => {
    return {

        get (target, prop, receiver) {
            if (prop === isProxy) return true;
            return Reflect.get(target, prop, receiver);
        },
        
        set(target, prop, newVal, receiver) {
            
            
            if (prop === isProxy) return true;
            const pathStr = [...proxy.path, prop].join(proxy.options.keySeparator)

            const isFromInspectable = newVal[fromInspectable]
            if (isFromInspectable) newVal = newVal.value

            const listeners = proxy.listeners.setters 

            // Set New Listeners Automatically (if global callback is specified)
            if (!target.hasOwnProperty(prop)) {
                if (typeof proxy.options.globalCallback === 'function') {
                    const id = proxy.path[0]
                    listenerUtils.set('setters', pathStr, newVal, proxy.options.globalCallback, {[id]: proxy.root}, proxy.listeners, proxy.options)
                }
            }


            // Create Proxies for Objects
            if (newVal) {
                const newProxy = proxy.create(prop, target, newVal)
                if (newProxy) newVal = newProxy
            }

            
            if (listeners) {
                const toActivate = listeners[pathStr]
                if (toActivate) listenerUtils.setterExecution(toActivate, newVal) // run callbacks
            }

            const callback = proxy.options.callback
            const info = proxy?.state?.[pathStr]?.value ?? {}
            runCallback(callback, pathStr, info, newVal)

            if (isFromInspectable) return true
            else return Reflect.set(target, prop, newVal, receiver);
        },
        // deleteProperty(target, key) {
        //     console.log('Delete', key)
        //     // if (!(key in target)) { return false; }
        //     // return target.removeItem(key);
        //     return true
        // }
    }
}
