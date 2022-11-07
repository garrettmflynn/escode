
import * as signal from '../noisy/index.esc'
import * as filter from '../../../../../../components/devices/extensions/filter/index.esc.js'


const filterOverride = {
    __children: {
        devices: filter
    }
}

export const __compose = [filterOverride, signal]

export const __children = {
    devices: {
        __children: {
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
    },
}