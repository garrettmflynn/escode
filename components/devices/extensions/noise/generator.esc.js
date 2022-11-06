import synthetic from '../../synthetic'

export const frequencies = []
export const amplitudes = []

export const sps = 512

export default function (info) {
    let count = 0
    let base = []

    if (this.frequencies.length === 1) base = this.frequencies[0]
    for (let key in info) {
        const arr = info[key]

        if (typeof arr.length === 'number'){
            const noise = synthetic(arr.length, [this.frequencies[count] ?? base], [], info.timestamps)
            info[key] = arr.map((v,i) => v + noise[0][i])
        }
        count++
    }

    return info
}