# graphscript-compose-loader
This loader recognizes several new **graph script** properties that can be used to compose Graph Nodes, including:
1. __compose: Use the specified objects as a base
2. __apply: Apply the specified objects to the current object

Both of these objects can be specified as objects, strings, or arrays of either. All strings are interpreted as the name of a file to compile.