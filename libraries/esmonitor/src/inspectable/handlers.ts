import * as listenerUtils from "../listeners";
import { runCallback } from "../utils";
import { 
    fromInspectable,
    isProxy 
} from '../globals'
import Inspectable from ".";
import define from "./define";

export const functions = function () {
    const inspectable = this as Inspectable
    return {
        apply: async function (target, thisArg, argumentsList) {
            try {

                let foo = target
                const isFromInspectable = argumentsList[0]?.[fromInspectable] 
                if (isFromInspectable) {
                    foo = argumentsList[0].value
                    argumentsList = argumentsList.slice(1)
                }

                let listeners = inspectable.listeners.functions
                // Notify of Function Execution
                const pathStr = inspectable.path.join(inspectable.options.keySeparator)

                const toActivate =  (listeners) ? listeners[pathStr] : undefined
                let output, executionInfo: any = {};

                if (toActivate){
                    executionInfo = listenerUtils.functionExecution(thisArg, toActivate, foo, argumentsList)
                    output = executionInfo.output
                } 
                
                // Default Behavior
                else {
                    output = foo.apply(thisArg, argumentsList);
                    executionInfo = inspectable?.state?.[pathStr]?.value ?? {}
                }

                
                // Notify with Proxy Callback
                const callback = inspectable.options.callback

                runCallback(callback, pathStr, executionInfo, output)

                // Return output to function
                return output

            } catch (e) {
                console.warn(`Function failed:`, e, inspectable.path);
            }
        }
    };
}

export const objects = function () {
    const inspectable = this as Inspectable
    return {

        get (target, prop, receiver) {
            if (prop === isProxy) return true;
            return Reflect.get(target, prop, receiver);
        },
        
        set(target, prop, newVal, receiver) {            
            
            if (prop === isProxy) return true;
            const pathStr = [...inspectable.path, prop].join(inspectable.options.keySeparator)

            const isFromProxy = newVal?.[isProxy]
            const isFromInspectable = newVal?.[fromInspectable]
            if (isFromInspectable) newVal = newVal.value

            const listeners = inspectable.listeners.setters 

            // Set New Listeners Automatically (if global callback is specified)
            const desc = Object.getOwnPropertyDescriptor(target, prop)
            const createListener = desc && !desc.get && !desc.set

            if (createListener) {
                if (typeof inspectable.options.globalCallback === 'function') {
                    const id = inspectable.path[0]
                    define.call(inspectable, prop, true) // Get notified when changed on the target
                    listenerUtils.set('setters', pathStr, newVal, inspectable.options.globalCallback, {[id]: inspectable.root}, inspectable.listeners, inspectable.options)
                }
            }


            // Create Proxies for Objects
            if (newVal) {
                const newProxy = inspectable.create(prop, target, newVal)
                if (newProxy) newVal = newProxy
            }

            const toActivate = !isFromProxy
            if (
                listeners 
                && toActivate // Don't manually trigger for proxies
                && !inspectable.newKeys.has(prop) // Don't manually trigger for new keys
            ) {
                const toActivate = listeners[pathStr]
                if (toActivate) listenerUtils.setterExecution(toActivate, newVal) // run callbacks
            }

            const callback = inspectable.options.callback
            const info = inspectable?.state?.[pathStr]?.value ?? {}
            runCallback(callback, pathStr, info, newVal)


            if (isFromInspectable || !toActivate) return true
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
