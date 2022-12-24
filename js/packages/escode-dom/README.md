# escode-dom
`escode-dom` is a library that allows you to create and manipulate DOM elements using ESCode syntax.

## The DOM Loader
The loader is composed of two parts, `escode-element-loader` and `escode-define-loader`. 
The `escode-element-loader` is responsible for creating DOM elements that correspond to your ES Components using the `__element` property.

On the other hand, the `escode-define-loader` is responsible for registering your ES Components as Web Components using the `__define` property—or a special object defined for the `__element` property.

> **Note:** Because of the latter point, the `escode-define-loader` and the `escode-element-loader` are mutually dependent on each other.

## The DOM Composer
The DOM Composer is a function that allows you to create an HTML file from a given ES Component.

> **Note:** The DOM Composer is only a proposal—though it has been roughly implemented in the[brainsatplay cli branch](https://github.com/brainsatplay/brainsatplay/blob/cli/src/views/html.js).