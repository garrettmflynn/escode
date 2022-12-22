# graphscript-parent-loader
This allows you to change the parent of a node in the graph. It introduces `__parent` as a reserved keyword.

When the `__parent` keyword is changed, the `__.path` and `__.graph` of the node are changed according to the new value.

Additionally, a new `__.parent` property has been created to allow for easier access to the `__parent` configuration. For instance, you may use `__.parent.add` in both **loaders** and **scripts** to specify a callback that will be applied when the parent is changed.