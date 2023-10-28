
import * as timeseries from "../../../js/components/ui/plot/timeseries/index.esc";
import * as devicesComponent from "../../../js/components/devices/ui/index.esc.js"

// import * as data from '../../../../js/components/devices/synthetic.js'
// const numSeconds = 3
// const sampleCt = 1
// const animationRate = 256
// const nSec = (numSeconds * animationRate) * sampleCt

export const __compose = timeseries

export const devices = devicesComponent

// export const data = {
//     sampleCt,
//     frequencies: [10],
//     __compose: data,
//     esAnimate: animationRate
// }

// export const plot = {
//     options: {
//         linePoints: nSec
//     }
// }

export const __listeners = {
    // 'plot': {
    //     'data': true
    // }
    'plot': {
        'devices.output': true
    }
}
