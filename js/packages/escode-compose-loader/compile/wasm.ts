const fetchAndInstantiateTask = async (uri, importObject) => {
    const wasmArrayBuffer = await fetch(uri).then(response => response.arrayBuffer());
    return WebAssembly.instantiate(wasmArrayBuffer, importObject);
};

// https://github.com/torch2424/wasm-by-example/blob/master/demo-util/
const load = async (uri, importObject) => {

    if (!importObject) importObject = { env: { abort: () => console.log("Abort!") } };

    if (WebAssembly.instantiateStreaming) return await WebAssembly.instantiateStreaming( fetch(uri), importObject );
    else return await fetchAndInstantiateTask(uri, importObject);
};

export default load