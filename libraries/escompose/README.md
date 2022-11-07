## escompose
[![Npm package version](https://badgen.net/npm/v/escompose)](https://npmjs.com/package/escompose)
[![Npm package monthly downloads](https://badgen.net/npm/dm/escompose)](https://npmjs.com/package/escompose)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**ES Components** is a standard for transforming ES Modules into standardized Web Components to simplify the process of authoring composable web applications.

The **escompose** library transforms ES Components into Web Components that respond to each other. 

> **escompose** is a core library of the [Brains@Play Framework](https://github.com/brainsatplay/brainsatplay)

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
 `named` exports define the states of the Component. 

 However, **multiple named exports** without a default function may also be passed. These are transformed into individual Components within the same graph.

 ## Special Properties
### Cross-File Properties
#### __define
This is a registry of ESC that you'd like to transform into Web Components.
- **Note:** This has to be loaded 

##### __compose
This is a key that allows you to specify how this ESC inherits from another.

#### __children
This is a tree of ESC instances that determine how they will be displayed on the screen—as well as how they're referenced in listener scope.

#### __listeners
This is a collection of configuration objects that specify how ESC will listen to each other.

### JSON / HTML Properties
#### __trigger
This allows you to run the default function of an ESC using the arguments specified here.
```json
{
    "__trigger": [true],
    "__compose": "./components/trigger.js'
}
```

#### __animate
This allows you to specify an animation loop for your component.
```json
{
    "__animate": 10, // Runs 10 times every second
    // "__animate": true, // Runs on the default animation loop
    "__compose": "./components/time.js'
}
```

## Acknowledgments
This library is maintained by [Garrett Flynn](https://github.com/garrettmflynn) and [Joshua Brewster](https://github.com/joshbrew), who use contract work and community contributions through [Open Collective](https://opencollective.com/brainsatplay) to support themselves.

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