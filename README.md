<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo_with_text_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo_with_text_light.svg">
    <img alt="escode: Recompose the Web" src="./assets/logo_with_text_light.svg">
  </picture>
</p>

[![Npm package version](https://badgen.net/npm/v/escode)](https://npmjs.com/package/escode)
[![Npm package monthly downloads](https://badgen.net/npm/dm/escode)](https://npmjs.com/package/escode)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

The [Brains@Play] **ESCode** project is a collection of ECMAScript libraries intended to further the Web as a **Universal Development Engine** by allowing you to create and share Web Components that naturally compose into larger applications.

**escode** implements the [ES Components] specification to allow you to define special properties on a hierarchy of reactive objects.

Unlike libraries that use hooks like useEffect (React) and watchEffect (Vue), ESCode monitors **arbitrary objects** for changes to their values based on specified **listeners**—meaning we don't require explicitly registering references or using returned objects.

## The Libraries
### [esmpile]
The [esmpile] library allows you to compile ESM code from their text sources. This allows you to track a list of active imports.

### [esmonitor]
The [esmonitor] library allows you to receive notification about changes to objects and their values via a _simple plain-text subscription interface for arbitrary object properties_.

### [escode]
The [escode] library allows you to transform ESM into Web Components that send messages to each other using the [ECMAScript Components (ESC)](./packages/escode/README.md#the-specification) specification.

### [escomposer]
The [escomposer] library allows you to convert between JS, JSON, and HTML declarations of ESC.

### [escompose]
The [escompose] library is a visual programming system to visualize and edit ESC files.

## Getting Started
To create a component, pass an object to the `create` function:
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

These objects are deep cloned, meaning that **all properties attached to the object itself are independent across instantiations**.

### Classes
If you prefer to work with classes, these will also be instanced using this function:

```js
import { create } from 'escode';

class MyButton {
    __element: 'button',
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
}

const component = create(MyButton, {__parent: document.body})
component.__element.click()
```

However, **class instances are assumed to be sufficiently instanced by the user**. As such, local objects attached to the class itself will be shared across instances.

### Arrays
In specific cases, an array may be useful to apply bulk operations to independent Components:
```js
import { create } from 'escode';

const components = create([button, myButton, button], {
    __parent: document.body,
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
})
components.forEach(component => component.__element.click())
```

### Linking Components to Source Text
A string can be passed to grab the Component from a local JavaScript file—or, with additional utilities, compile from source text:
```js
import { create } from 'escode';
import * as esm from 'esmpile'

const button = './index.esc.js'
const component = create(button)
const component = create(button, {__parent: document.body},  { utilities: { bundle: esm.bundle.get}})
component.__element.click()
```


### Creating Components from Functions
A function can be passed directly as a Component, which wraps it as the `default` function of a new component:

```js
import { create } from 'escode';

const fn = (input) => {
    console.log(input)
    return input
}
const component = create(fn)
component.default()
```

If you're looking to listen to a function, you can simply add it as a property _inside_ a valid ES Component object.

```js
import { create } from 'escode';

const reactive = {
    fn,
    latest,
    __listeners: {
        fn: 'latest'
    }
}

const component = create(reactive)
component.fn(1)
```

### Applying Components to DOM Element
Elements can be passed to apply Components to existing DOM elements:
```js
import { create } from 'escode';

const button = document.querySelector('button')
const component = create(button, {
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
})
component.__element.click()
```

## GraphScript Properties
GraphScript properties refer to **special properties that are used to instantiate the Component**. These properties are prefixed with `__` and are recognized with **loaders** than can be used to experiment with new Component behaviors

> See the [ES Components] specification for a full list of default properties. 

All ES Components have at least one GraphScript property at instantiation. All other properties throughout an ES Component are listeneable by the root Component.

> **Note:** This includes classes and functions. Classes will not be instantiated without a static `__` property. On the other hand, functions will not converted to a `default` property without a `__` property set—though they will still be listenable without it.

Active components are recognized by the presence of the `__` property on them. This provides access to utilities such as `run` and `subscribe`—as well as retains a record of read-only properties maintained by the library itself.

All other `__` properties are considered GraphScript properties, and are used to program the behavior of the Component. 

### Component Instancing
Components are created using the `create` factory function, which accepts any object (e.g. Object, Array, or Class) and outputs an analogous object.

**Unlike graphscript, we do not return a standard class from the `create` function.** Instead, the Component is returned based on the type of the input object.

#### Objects
Objects are extensively instanced and treated as templates. This means that **all properties attached to the object itself are independent across instantiations**. 

#### Classes
Classes are instanced using the `new` keyword. The resulting instancing behavior is assumed to be appropriate for the Component. This allows for minimal performance overhead when using classes.

#### Arrays
Arrays are iterated over and each item is passed to the factory function. The resulting array is returned.

## Loaders
Additional properties can be added using the loaders argument for escode: 
```js
import { create } from 'escode';
const component = create(input, undefined, {
    loaders: [ myLoader ]
})
```

## Current Benchmarks
| Metric | [escode] | [graphscript] |
| --- | ----------- | ----------- |
| Core Size - bundled | 86kb | 39kb |
| Core Size - minified | 37kb | 20kb |
| Instantiation Time | 3.15ms | — |
| Instantiation w/ Explicit Children | 2.7963ms | 3.15ms |
| Listener Reaction Time | 0.026ms | 0.015ms |

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Additional Repository Information
### [components](./components/README.md)
This is intended to be an official repository of ES Components.

In the near future, we will switch to the registration of ES Components through NPM via standardized use of the `graphscript` and `escomponent` keywords. These existing components will be published and distributed into independent repositories.

To learn more about the publication workflow, see the [escomponent](https://github.com/brainsatplay/escomponent) template repository.

## Acknowledgments
Our work at [Brains@Play] is sustained by a wide range of contract work and the generous support of our community through [Open Collective](https://opencollective.com/brainsatplay):

### Backers
[Support us with a monthly donation](https://opencollective.com/brainsatplay#backer) and help us continue our activities!

<a href="https://opencollective.com/brainsatplay/backer/0/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/1/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/2/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/3/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/4/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/5/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/6/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/7/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/8/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/9/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/10/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/11/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/12/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/13/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/14/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/15/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/16/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/17/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/18/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/19/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/20/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/21/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/22/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/23/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/24/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/25/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/26/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/27/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/28/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/backer/29/website" target="_blank"><img src="https://opencollective.com/brainsatplay/backer/29/avatar.svg"></a>

### Sponsors

[Become a sponsor](https://opencollective.com/brainsatplay#sponsor) and get your logo here with a link to your site!

<a href="https://opencollective.com/brainsatplay/sponsor/0/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/1/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/2/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/3/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/4/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/5/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/6/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/7/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/8/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/9/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/10/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/11/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/12/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/13/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/14/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/15/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/16/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/17/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/18/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/19/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/20/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/21/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/22/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/23/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/24/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/25/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/26/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/27/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/28/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/brainsatplay/sponsor/29/website" target="_blank"><img src="https://opencollective.com/brainsatplay/sponsor/29/avatar.svg"></a>


[graphscript]: https://github.com/brainsatplay/graphscript
[escompose]: ./packages/escompose/README.md
[Brains@Play]: https://github.com/brainsatplay

[esmpile]: ./packages/esmpile/README.md
[esmonitor]: ./packages/esmonitor/README.md
[escomposer]: ./packages/escomposer/README.md
[escode]: ./packages/escode/README.md
[ES Components]: https://github.com/brainsatplay/escomponent