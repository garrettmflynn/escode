# escode-ide
[![Npm package version](https://badgen.net/npm/v/escode-ide)](https://npmjs.com/package/escode-ide)
[![Npm package monthly downloads](https://badgen.net/npm/dm/escode-ide)](https://npmjs.ccom/package/escode-ide)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**escode-ide** is the **Universal Web Development IDE** developed by Brains@Play for ESM / [ESC](https://github.com/brainsatplay/escomponent) applications and APIs. It allows for visual debugging and live editing with minimal modification of your existing codebase.

Additionally, it is designed to support user-defined themes for simple integration into existing applications.

> **escode-ide** is the centerpiece of the [Brains@Play Framework](https://github.com/brainsatplay/brainsatplay/blob/main/README.md), as it allows users to understand the big picture (i.e. rapid prototyping of high-performance web applications) before slowly peeling back each layer of the framework.

### Core Views
#### Flow Graph
This view represents the complete logic of the application. In other words, how **data** flows between **instances** of [components].

#### Properties Tab (TBD)
This view represents the specific attributes of a single **instance** of [components].

#### File Tree
This view represents the file structure of an application.

#### Code Editor
This view represents the **source code** of each of the [components].


#### Plugin Search
This popup allows users to search for components using the [components] repo.

#### Relations List (TBD)
This view is an "if this, then that" system for defining flows of **data** in the application.

#### Welcome Screen
##### Templates
Browse existing [components] and start with them. Only show those that have been marked with the `template` tag.

##### Quick Select
Tell us your project requirements (e.g. for input / output modality) and we'll build a template for you
