export let sampleCt = 1000
export const nChannels = 1

export const amplitudes = []

export default function () {

    let output = {}
    for (let i = 0; i < this.nChannels; i++) {
        if (!this.amplitudes[i]) this.amplitudes[i] = 5*Math.random()

        const a = this.amplitudes[i]
        const f = 1 + 2*i
        output[i] = new Array(this.sampleCt).fill(0).map((v,j)=>{ return a*Math.sin(2*Math.PI*(f)*(Date.now()/1000+(j/this.sampleCt))); })
    }

    return output
}