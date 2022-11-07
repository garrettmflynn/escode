import * as button from "../../../../../../components/ui/button.js"
import * as start from "../../../../../../components/drafts/old/datastreams/components/start.js"
import * as average from "../../../../../../components/basic/average.js"
import * as threshold from "../../../../../../components/basic/threshold.js"
import * as muse from "../../../../../../components/drafts/old/devices/muse/index.js"

export const __children = {} as any
export const __listeners = {} as any

__listeners.threshold = 'average'
__listeners.average = 'datastreams'
__listeners.datastreams = "muse"
__listeners.muse = "button"

__children.average = {
    __compose: average,
}


__children.threshold = {
    value: 300,
    __compose: threshold,
}


__children.muse = {
    __compose: muse,
}

const buttonElementConfig = button.__element
buttonElementConfig.attributes.innerText = 'Connect Player 1'
buttonElementConfig.style = {
    'z-index': 100,
    position: 'absolute',
    top: '0',
    left: '0',
}

__children.button = {
    __element: buttonElementConfig,
    __compose: button,
}


__children.datastreams = {
    __compose: start
}