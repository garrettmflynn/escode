
import * as signal from '../noisy/index.esc'
import * as filter from '../../../../../../components/devices/extensions/filter/index.esc.js'


const filterOverride = {
    esDOM: {
        devices: filter
    }
}

export const esCompose = [filterOverride, signal]

export const esDOM = {
    devices: {
        esDOM: {
            filter: {
                settings: {
                    useBandpass: true,
                    useDCBlock: true,
                    useNotch50: true,
                    useNotch60: true,
                },
            }
        }
    },
}