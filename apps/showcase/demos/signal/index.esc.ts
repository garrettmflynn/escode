
import * as timeseries from "../../../../components/ui/plot/timeseries/index.esc";
import * as devices from "../../../../components/devices/ui/index.esc.js"

// import * as data from '../../../../components/devices/synthetic.js'
// const numSeconds = 3
// const sampleCt = 1
// const animationRate = 256
// const nSec = (numSeconds * animationRate) * sampleCt

export const __compose = timeseries

export const __children = {
    // data: {
    //     sampleCt,
    //     frequencies: [10],
    //     __compose: data,
    //     esAnimate: animationRate
    // },
    devices,
    // plot: {
    //     options: {
    //         linePoints: nSec
    //     }
    // },
}

export const __listeners = {
    // 'plot': {
    //     'data': true
    // }
    'plot': {
        'devices.output': true
    }
}
