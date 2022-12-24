# Design Decisions
## __ Flag vs. __children Property
Explicit flagging is preferred to encapsulation for the following reasons:

1. It avoids overcoding a key when nested components are, at least in listener scope, flatted to the main object using a __children flag.

    - Relatedly, we don’t actually have to flatten an object and modify it—nor do we have to continually drill through __children wrappers.

2. It allows for any object property to be “empowered” as a component through the addition of a __ flag without moving where the reference is. 
