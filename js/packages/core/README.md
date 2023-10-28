# escode-core
The ESCode core is a lightweight package for defining special properties on a hierarchy of reactive objects.

## Usage

```js
import { create } from 'escode';

const esc = {
    value: 0,
    update: function () {
        this.value++;
    },
    __listeners: {
        fn: 'value'
    }
}

const component = create(esc)
component.update()
```

## Documentation
See https://github.com/garrettmflynn/escode