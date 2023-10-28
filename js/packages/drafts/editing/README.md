# brainsatplay
[![Npm package version](https://badgen.net/npm/v/brainsatplay)](https://npmjs.com/package/brainsatplay)
[![Npm package monthly downloads](https://badgen.net/npm/dm/brainsatplay)](https://npmjs.ccom/package/brainsatplay)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**brainsatplay** extends ESCode to allow for editing high-performance web applications at runtime—as well as saving changes to the local filesystem using the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API).

> **Note:** **brainsatplay** is a core library of the [Brains@Play Framework](../../README.md)

## Getting Started
> See complete documentation for the Brains@Play Framework at [docs.brainsatplay.com](https://docs.brainsatplay.com).

```javascript
import * as brainsatplay from 'https://cdn.jsdelivr.com/npm/brainsatplay/dist/index.esm.js'

 let app = new brainsatplay.App(
         'https://raw.githubusercontent.com/brainsatplay/wasl/main/tests/0/0.0/0.0.0/external/index.esc.json', // undefine to select from filesystem | object to load directly | string for url imports
        {
            edit: true
        }
    )
        const esc = await app.start(undefined, optionsToPass)

        if (esc){
            console.log('App', app)
            console.log('Errors', esc.errors)
            console.log('Warnings', esc.warnings)
        }

```
