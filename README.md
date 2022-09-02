## ECMAScript Plugins (ES Plugins)

**ES Plugins** is a standard for transforming ES Modules into standardized Web Components to simplify the process of authoring composable web applications.

This library uses [graphscript](https://github.com/brainsatplay/graphscript) to compose plugins—as well as its `DOMService` class to transform plugins into Web Components.

## Benefits
- Faster prototyping and production-grade development
    - Visualization and editing of web applications at runtime
- Contribution to an open ecosystem

## The Specification
Each Plugin contains one `default` export and any number of `named` exports.

``` javascript
export let nExecutions = 0

export default function(){
    this.nExecutions++
    return this.nExecutions
}
```

As such, this specification treats **namespace imports** (which access default *and* named exports) as first-class citizens.

### Default Exports
The `default` export defines the behavior of the Plugin.

### Named Exports
 `named` exports define the states of the Plugin. 

 However, **multiple named exports** without a default function may also be passed. These are transformed into individual plugins within the same graph.