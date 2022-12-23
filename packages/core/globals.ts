globalThis.escomposePerformance = {
    create: [],
    resolve: [],
    resolveAll: [],
    listeners: {
        create: [],
        resolve: [],
    },
    averages: function () {

        const averages = {
            create: 0,
            resolve: 0,
            resolveAll: 0,
            listeners: {
                create: 0,
                resolve: 0,
            }
        }

        for (const key in averages) {
            if (typeof this[key] === 'object' && !Array.isArray(this[key])) {
                for (const subKey in this[key]) {
                    averages[key][subKey] = this[key][subKey].reduce((a, b) => a + b, 0) / this[key][subKey].length
                }
            } else averages[key] = this[key].reduce((a, b) => a + b, 0) / this[key].length
        }
        return averages
    }
}