# escompose
[![Npm package version](https://badgen.net/npm/v/escompose)](https://npmjs.com/package/escompose)
[![Npm package monthly downloads](https://badgen.net/npm/dm/escompose)](https://npmjs.com/package/escompose)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**escompose** implements the [ES Components] specification to allow you to define special properties on a hierarchy of reactive objects.

> **escompose** is a core library of [Brains@Play].

## Getting Started
To create a component, pass any object with GraphScript properties to the `create` function:
```js
const esc = {
    __element: 'button',
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
}

const component = escompose.create(esc, {__parent: document.body})
component.__element.click()
```

If you prefer to work with classes, these will also be instanced using this function:

```js
class MyButton {
    __element: 'button',
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
}

const component = escompose.create(MyButton, {__parent: document.body})
component.__element.click()
```

In specific cases, an array may be useful to apply bulk operations to independent Components:
```js
const components = escompose.create([esc, myButton, esc], {
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
import * as esm from 'esmpile'
const esc = './index.esc.js'
const component = escompose.create(esc)
const component = escompose.create(esc, {__parent: document.body},  { utilities: { bundle: esm.bundle.get}})
component.__element.click()
```


### Creating Components from Functions
A function can be passed directly as a Component, which simply makes it listenable:
```js
const esc = (input) => console.log(input)
const component = escompose.create(esc, {__parent: document.body})
component.default()
```

### Applying Components to DOM Element
Elements can be passed to apply Components to existing DOM elements:
```js
const esc = document.querySelector('button')
const component = escompose.create(esc, {
    __attributes: {
        onclick: function (input) { console.log(this) }
    }
})
component.__element.click()
```

## GraphScript Properties
See the [ES Components] specification for a full list of properties.

### Loaders
Additional properties can be added using the loaders argument for escompose: 
```js
const component = escompose.create(esc, {__parent: document.body}, {
    loaders: [ myLoader ]
})
```

## Acknowledgments
[Brains@Play] is managed by [Garrett Flynn](https://github.com/garrettmflynn) and [Joshua Brewster](https://github.com/joshbrew), who use contract work and community contributions through [Open Collective](https://opencollective.com/brainsatplay) to support themselves.

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

[ES Components]: https://github.com/brainsatplay/escomponent
[Brains@Play]:https://github.com/brainsatplay