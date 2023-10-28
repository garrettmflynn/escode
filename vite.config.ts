import wasm from "vite-plugin-wasm";

export default {
    base: './',
    optimizeDeps: { exclude: ["fsevents"] },
    plugins: [
        wasm()
    ],
}