# Issues
0. This needs to use the `compose` helper function to assemble the entire ESC (so we know what type of element it'll be...)
   - Relatedly, we have not even approached converting from JS...
1. Cannot stringify listener configs with functions in them
   - This will result in cyclical behavior for button and input
2. We are not inheriting onSubmit at all...

## Notes
- Compilation from HTML will naturally become overspecified.