# .esc
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**esc** is a file format and specification language for defining Web applications. It allows JavaScript developers to specify a JSON tree of source files and custom scripts. This then executes a program stored across the Web.

> **Note:** **esc** is a core specification of the [Brains@Play Framework](https://github.com/brainsatplay/brainsatplay)

## The Details
.esc files inherit heavily from the `package.json` file from Node.js, allowing for less duplication of work when publishing to NPM.

The specification is written in [JSON Schema](https://json-schema.org/) and validated using [Ajv](https://ajv.js.org/). Typescript types are generaged using [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript). 

## Design Highlights
- New `components` and `listeners` fields that declare application code files and associations with other files.
- The adoption of [ES Components](https://github.com/brainsatplay/escode) to instantiate Web Components through a configuration object

###  Example .esc File
```json
{
    "__children": {
        "first": {
            "__compose": "first.esc.json",
            "extensions": {
                "arbitrary": {
                    "x": 1080,
                    "y": 720
                }
            }
        } ,
        "second": {
            "href": "https://example.com/second",
            "children": {
                "third": true
            }
        },
         "third": {
            "__compose": "./test.js"
        } 
    },

    "listeners": {
        "first.component": {
            "second": true
        }
    }
}
```

## The Libraries
The libraries in this repo validate and load .esc files into JavaScript.

### Libraries
1. `escode` - Load the `src` keys into a .esc file.
2. `escode-validate` - Validation of a .esc file using JSON Schema (Ajv)

### Features
- Validation of original JSON files and loaded objects against the JSON Schema
- Automatic merging of ESM imports specified using the `src` key (anywhere in the .esc file!) to their containing objects.

#### Errors vs Warnings
Errors indicate that the .esc file will not run.

Warnings indicate that there is suboptimal syntax in the files themselves. However, these are corrected to load the file and don't impact loaded object format.

## Contributing
 > **Note:** Use Node v16.15.0 or higher (which support import assertions for JSON files) to run the tests