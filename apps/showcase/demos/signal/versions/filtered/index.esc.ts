
import * as signal from '../../index.esc'
import * as filter from '../../../../../../components/devices/filter.esc.js'

export const esCompose = signal

export const esDOM = {
    devices: {
        esCompose: filter // TODO: Merge so that this never overwrites an existing array...
    }
}
