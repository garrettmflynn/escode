## ECMAScript Components (ES Components)

**ES Components** is a standard for transforming ES Modules into Web Components to simplify the process of authoring composable web applications.

## Benefits for your Organization
- Faster prototyping and production-grade development
    - Visualization and editing of web applications at runtime
- Contribution to an Open ecosystem

## The Specification
Each Component contains one `default` export and any number of `named` exports.

``` javascript
export let nExecutions = 0

export default function(){
    this.nExecutions++
    return this.nExecutions
}
```

As such, this specification treats **namespace imports** (which access default *and* named exports) as first-class citizens.

### Default Exports
The `default` export defines the behavior of the Component.

### Named Exports
 `named` exports define the states of the Components. 

### Stateless vs Stateful Components
If the `default` export uses a **standard function** (as opposed to an arrow function), the Component can be **stateful** and will modify its unique state.

On the other hand, **arrow functions** used for `default` exports imply that (1) the Component is **stateless**, or (2) states are shared across all objects that inherit from the Component.