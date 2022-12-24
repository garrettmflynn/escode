export let sampleCt = 1
export const nChannels = 0

export const amplitudes = []
export const frequencies = []

export function __onconnected () {

    // Just a useful variable to know how many channels we will have
    if (!this.nChannels) {
        if (this.frequencies.length) this.nChannels = this.frequencies.length
        else if (this.amplitudes.length) this.nChannels = this.amplitudes.length
    }

    for (let i = 0; i < this.nChannels; i++) {
        const a = this.amplitudes[i]
        const f = this.frequencies[i]
        const nF = f.length
        const nA = a?.length

        if (a == undefined) this.amplitudes[i] = new Array(nF ?? 1).fill(1)
        else if (!Array.isArray(a)) this.amplitudes[i] = new Array(aConfig).fill(a)
        else if (nA < nF) this.amplitudes[i] = new Array(nF ?? 1).fill(a[0])

        if (f === undefined) this.frequencies[i] = new Array(nA ?? 1).fill(1 + 2*i)
        else if (!Array.isArray(f)) this.frequencies[i] = new Array(nA ?? 1).fill(f)
        else if (nF < nA) this.frequencies[i] = new Array(nA ?? 1).fill(f[0])
    }



}

const getTime = (timestamps, k) =>  (timestamps[k] ?? Date.now())/1000


export default function (
    count = this.sampleCt, 
    frequencies = this.frequencies,
    amplitudes = this.amplitudes,
    timestamps = []
    ) {

    let output = {}
    frequencies.forEach((freqs, i) => {
        const amps = amplitudes[i]
        output[i] = new Array(count).fill(0)
        freqs.forEach((f, j) => {
            const a = amps?.[j] ?? 1
            output[i] = output[i].map((v, k) => v + a*Math.sin(2*Math.PI*(f)*(getTime(timestamps, k)+(k/count))))
        })
    })

    return output
}