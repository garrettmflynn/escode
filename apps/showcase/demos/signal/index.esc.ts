
import * as timeseries from "../../../../components/ui/plot/timeseries/index.esc";
import * as devices from "../../../../components/devices/ui/index.esc.js"

// import * as data from '../../../../components/devices/synthetic.js'
// const numSeconds = 3
// const sampleCt = 1
// const animationRate = 256
// const nSec = (numSeconds * animationRate) * sampleCt

export const esCompose = timeseries

export const esDOM = {
    // data: {
    //     sampleCt,
    //     frequencies: [10],
    //     esCompose: data,
    //     esAnimate: animationRate
    // },
    devices,
    // plot: {
    //     options: {
    //         linePoints: nSec
    //     }
    // },
}

export const esListeners = {
    // 'plot': 'data'
    'plot': 'devices.output'
}
