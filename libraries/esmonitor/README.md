# esmonitor
 Monitor ESM objects for changes

**esmonitor** allows you to monitor ESM objects for changes.

This library uses three different methods for recognizing changes:
1. **Wrapping functions** to allow for output interception
2. **Adding setters** to objects, which are triggered on updates
3. **Intermittent polling** for objects (e.g. ES Modules) that don't allow setters or redeclaration of functions.

## Getting Started
```js
const monitor = new Monitor()

// ---------------- Register Object ----------------
const id = 'actor'
const add = (input) => input + 1
const actor = { nested: { add } }

const storeId = 'store'
const store = { value: 0 }

monitor.set(id, actor, {static: false})
monitor.set(storeId, store, {static: false})


// ---------------- Create Listeners for the Entire Object ----------------
const functionPath = ['nested', 'function']

const testSubs = monitor.on(storeId, (path, ...args) => {
    console.log(`Updated Store (${path}) - ${args}`)
})

// ---------------- Selectively Listen to Object Property ----------------
const fSubs = monitor.on([id, ...functionPath], (path, ...args) => {
    console.log(`Update from Function (${path}) - ${args}`)
    store.value = args[0] // set store value
    store.updated = true
})

reference.nested.function(store.value)

monitor.remove() // Remove all subscriptions
```


### Polling
The `polling` option allows you to specify a custom sampling rate for changes to your modules: 

```js
const monitor = new Monitor({
    polling: {
        sps: 60
    }
})
```

This may also be set directly on the `Poller` object:
```js
monitor.poller.sps = 60
```


## Notes
- Setting the same object multiple times can have unexpected behavior. For example, passing a function by reference to two (parts of the same object) will result in **only the first of these functions that are set** to have the correct behavior.

- The top level of dynamic objects **will only respond** to changes to their original objects **if those keys were present on initialization**. This is unlike the behavior of setting the Proxy object directly (or objects nested inside it, which have been converted to Proxies).