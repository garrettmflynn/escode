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
const actor = {
    nested: {
        function: (input) => input + 1, 
    }
}

const storeId = 'store'
const store = {
    value: 0
}

monitor.set(id, actor)
monitor.set(storeId, store)


// ---------------- Create Listeners for the Entire Object ----------------
const functionPath = ['nested', 'function']

const testSubs = monitor.on(storeId, (path, ...args) => {
    console.log(`Updated Store (${path}) - ${args}`)
})

// ---------------- Selectively Listen to Object Property ----------------
const fSubs = monitor.on([id, ...functionPath], (path, ...args) => {
    console.log(`Update from Function (${path}) - ${args}`)

    store.value = args[0] // set store value
    console.log('New Store Value', store.value)

    store.test = store.value * 100
})

store.value = 1
reference.nested.function(store.value)

monitor.remove(testSubs) // Clear test subscriptions only

const set = store.value + 1
store.value = set // No response
reference.nested.function(store.value) // Received

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