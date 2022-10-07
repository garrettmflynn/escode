const tsconfig = {
    compilerOptions: {
        "target": "ES2015",
        "module": "ES2020",
        "strict": false,
        "esModuleInterop": true
    }
}

export const typescript = (response, type = "text") => {
    if (window.ts) {
        const tsCode = (type !== 'buffer') ? response[type].updated : new TextDecoder().decode(response[type]);
        response.text.updated = window.ts.transpile(tsCode, tsconfig.compilerOptions);
        if (type === 'buffer') {
            response.buffer = new TextEncoder().encode(response.text.updated); // encode to buffer
            return response.buffer
        } else return response.text.updated
    } else throw new Error('Must load TypeScript extension to compile TypeScript files using remoteESM.load.script(...);')

}