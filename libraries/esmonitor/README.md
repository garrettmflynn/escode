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
const id = 'object'
const reference = {
    value: 1,
    nested: {
        function: (input) => input, 
    }
}

monitor.set(id, reference)

// ---------------- Create Listeners for the Entire Object ----------------
const functionPath = ['nested', 'function']

const testSubs = monitor.on(id, (path, ...args) => {
    console.log(`Update Object (${path}) - ${args}`)
})

// ---------------- Selectively Listen to Object Property ----------------
const fSubs = monitor.on([id, ...functionPath], (path, ...args) => {
    console.log(`Update Function (${path}) - ${args}`)
})

reference.value = 2
reference.nested.function('Received!')

monitor.remove(testSubs) // Clear test subscriptions only


reference.value = 3 // No response
reference.nested.function('Received again') // Received

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