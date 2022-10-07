

export const stats = null

export function reset(input) {
    if (input){
        const stats = {
            currentTimestamp:Date.now(),
            lastTimestamp:Date.now(),
            latestRaw:{},
            latestRMS:{},
            sampleError:{},
        }

        return stats
    }
}

export default function preprocess(input) {
    if (!this.stats) this.stats = reset(true)


    console.log('Data', input)
    this.stats.latestRaw = input;

    let rmskeys = Object.keys(this.stats.latestRMS ?? {}); //1 second RMS average used as predicted value for getting the error

    if(rmskeys.length > 0) { 
        rmskeys.forEach((key) => {
            if(this.stats.latestRaw[key] && key !== 'timestamp') {
                if(Array.isArray(this.stats.latestRaw[key])) {
                    this.stats.sampleError[key] = this.stats.latestRaw[key].map((v) => {
                        return Math.abs(this.stats.latestRMS[key] - v);
                    });
                }
                else {
                    this.stats.sampleError[key] = Math.abs(this.stats.latestRMS[key] - v);
                }
            }
        });
        this.stats.sampleError.timestamp = this.stats.latestRaw.timestamp;
        // if(recording) {
        //     info.routes.csv2.worker.post('appendCSV',this.stats.sampleError)
        // }
        requestAnimationFrame(rmseanim);
    }

    return this.stats
}