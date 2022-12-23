# escode

ESCode implements the [ES Components] specification to allow you to define special properties on a hierarchy of reactive objects.

The `escode` package contains only the functionality necessary to define [ES Components].

## Usage

```js
import { create } from 'escode';

const button = {
    __element: 'button',
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
}

const component = create(button, {__parent: document.body})
component.__element.click()
```

## Documentation

See https://github.com/brainsatplay/escode