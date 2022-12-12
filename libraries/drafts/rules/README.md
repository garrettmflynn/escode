# rules
Rules allow ES Components to be applied to any element on the screen in a simple way.

## Usage
To use rules, you must first import the rules module:

```js
import { Rule } from '.';
```

Then you can use the rules module to apply a rule to an element:

```js
const element = document.getElementById('myElement');
const component = {
    __parent: document.body
}
const rule = new Rule(component)
rule.apply(element);

```

```