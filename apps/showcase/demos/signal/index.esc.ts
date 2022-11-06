
import * as signal from "../../../../components/ui/plot/timeseries";
import * as devices from "../../../../components/ui/devices/index.esc.js"

// import * as data from '../../../../components/devices/synthetic.js'
// const numSeconds = 3
// const sampleCt = 1
// const animationRate = 256
// const nSec = (numSeconds * animationRate) * sampleCt

export const esCompose = signal

export const esDOM = {
    // data: {
    //     sampleCt,
    //     frequencies: [10],
    //     esCompose: data,
    //     esAnimate: animationRate
    // },
    devices,
    // plotter: {
    //     options: {
    //         linePoints: nSec
    //     }
    // },
}

export const esListeners = {
    // 'plotter': 'data'
    'plotter': 'devices.output'
}
