
import * as signal from '../noisy/index.esc'
import * as filter from '../../../../../js/components/devices/extensions/filter/index.esc.js'


const filterOverride = {
    devices: filter
}

export const __compose = [filterOverride, signal]

export const devices = {
        filter: {
            settings: {
                useLowpass: true,
                lowpassHz: 40,
                useDCBlock: true,
                useNotch50: true,
                useNotch60: true,
            },
        }
}
