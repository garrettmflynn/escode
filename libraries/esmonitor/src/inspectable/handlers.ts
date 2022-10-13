export const isProxy = Symbol("isProxy")

export const functions = (proxy) => {
    return {
        apply: async function (target, thisArg, argumentsList) {
            try {
                console.log(`Function is running in:`, proxy.proxy.path, proxy.parent,target, argumentsList);
                const output = await target.apply(thisArg, argumentsList);
                console.log('Function output:', output);
                if (proxy.callback instanceof Function) proxy.callback(proxy.path.join(proxy.options.keySeparator), {}, output)
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

            // let messageStr;
            // if (!target.hasOwnProperty(prop)) messageStr = 'New Property!'
            // else if (target[prop] !== newVal) messageStr = 'Changed Value!'
            // else messageStr = 'Same Value!'
            // console.log(messageStr, prop, newVal, proxy.path)

            if (proxy.callback instanceof Function) proxy.callback([...proxy.path, prop].join('.'), {}, newVal)

            // Create Proxies for Objects
            // TODO: Drill down to create proxies for all objects
            if (newVal) proxy.create(prop, target, newVal)

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
