import asc from "assemblyscript/asc";

const myArgs = process.argv.slice(2);

const getInfo = (name='index') => {
  return [
    // Command line options
    `./src/${name}.asc.ts`,
    "--outFile", `./compiled/${name}.wasm`,
    "--optimize",
    "--sourceMap",
    "--stats"
  ]
}

const info = getInfo(myArgs[0])  // Use CLI argument to declare the name of the file to compile

const { error, stdout, stderr, stats } = await asc.main(info, {
//   // Additional API options
//   stdout?: ...,
//   stderr?: ...,
//   readFile?: ...,
//   writeFile?: ...,
//   listFiles?: ...,
//   reportDiagnostic?: ...,
//   transforms?: ...
});
if (error) {
  console.log("Compilation failed: " + error.message);
  console.log(stderr.toString());
} else {
  console.log(stdout.toString());
}