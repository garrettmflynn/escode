# escode-cli
[![Npm package version](https://badgen.net/npm/v/escode-cli)](https://npmjs.com/package/escode-cli)
[![Npm package monthly downloads](https://badgen.net/npm/dm/escode-cli)](https://npmjs.com/package/escode-cli)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/community-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**escode-cli** is the official command line inteface (CLI) of the [ESCode](https://github.com/brainsatplay/escode).

### Getting Started
#### Installation
##### Basic
``` bash
npm i escode-cli
```

##### Development
``` bash
npm i -g
```

#### Usage
##### List All Commands
``` bash
escode
```

##### Convert ESC Files
This command allows you to convert the first file into the second one.
``` bash
escode convert demo/index.esc.json demo/output/index.esc.html
```

##### Compare ESC Files
This command allows you to test whether the conversion of the first file matches the second file.
``` bash
escode compare index.esc.json index.esc.html
```

##### Watch ESC Project
This command allows you to link JSON and HTML file edits together.
``` bash
escode watch index.esc.json index.esc.html
```

### Features
- [x] Monitor changes to code files for **multiple simultaneous views**
    - [x] Update HTML from JSON. Vice versa. 
    - [ ] Focus on writing JS.
    - [ ] Write an entire UI in HTML. Add the dynamic features with JSON + ESM.
- [ ] Bundle app into a single "recipe" by converting ESC into ESM with references bundled (using an esbuild plugin)

## Support
If you have questions about developing with [escode-cli], feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).