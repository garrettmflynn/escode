const config = {
    bundler: { 
        entryPoints: [  "./index.esc" ],
        outfile: "dist/index", 
        bundleESM: true, 
        minify: true,
        sourcemap: true,
     },
    server: false
}

export default config;