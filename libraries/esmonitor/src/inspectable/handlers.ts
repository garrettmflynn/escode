import { functionExecution, setterExecution } from "../listeners";
import { runCallback } from "../utils";

export const isProxy = Symbol("isProxy")

export const functions = (proxy) => {
    return {
        apply: async function (target, thisArg, argumentsList) {
            try {

                // Notify of Function Execution
                const pathStr = proxy.path.join(proxy.options.keySeparator)

                const listeners =  (proxy.listeners) ? proxy.listeners.functions[pathStr] : undefined
                let output, executionInfo: any = {};

                if (listeners){
                    executionInfo = await functionExecution(thisArg, listeners, target, argumentsList)
                    output = executionInfo.output
                } 
                
                // Default Behavior
                else {
                    output = await target.apply(thisArg, argumentsList);
                    executionInfo = proxy?.state?.[pathStr]?.value ?? {}
                }
                
                // Notify with Proxy Callback
                const callback = proxy.options.callback
                runCallback(callback, pathStr, executionInfo, output)

                // Return output to function
                return output
            } catch (e) {
                console.warn(`Cannot run function:`, e, proxy.proxy.path, proxy.parent, target, argumentsList);
            }
        }
    };
}

export const objects = (proxy) => {
    return {

        get (target, prop, receiver) {
            if (prop === isProxy) return true;
            return Reflect.get(target, prop, receiver);
        },
        
        set(target, prop, newVal, receiver) {
            
            if (prop === isProxy) return true;
            const pathStr = [...proxy.path, prop].join(proxy.options.keySeparator)

            // Create Proxies for Objects
            if (newVal) {
                // if (!proxy.options.listenDeeper || proxy.target[proxy.options.listenDeeper]) {
                    const newProxy = proxy.create(prop, target, newVal)
                    if (newProxy) newVal = newProxy
                // }
            }

            
            if (proxy.listeners) {
                const listeners = proxy.listeners.setters[pathStr]
                console.log('Checking', pathStr, listeners, proxy.listeners.setters)

                if (listeners) setterExecution(listeners, newVal) // run callbacks
            }

            const callback = proxy.options.callback
            const info = proxy?.state?.[pathStr]?.value ?? {}
            runCallback(callback, pathStr, info, newVal)

            return Reflect.set(target, prop, newVal, receiver);
        },
        // deleteProperty(target, key) {
        //     console.log('Delete', key)
        //     // if (!(key in target)) { return false; }
        //     // return target.removeItem(key);
        //     return true
        // }
    }
}
