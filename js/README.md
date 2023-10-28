# escode
ESCode implements the [ES Components](../spec/README.md) specification to allow you to define special properties on a hierarchy of reactive DOM objects.

The `escode` package contains the functionality necessary to define [ES Components].

Relatedly, the [core](./packages/core) is a lightweight package that contains the core functionality of ESCode without DOM features.

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
See https://github.com/garrettmflynn/escode