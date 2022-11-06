const config = {
    bundler: { 
        entryPoints: [  "./index.esc" ],
        outfile: "dist/index", 
        bundleESM: true, 
        minify: false,
        sourcemap: true,
     },
    server: false
}

export default config;