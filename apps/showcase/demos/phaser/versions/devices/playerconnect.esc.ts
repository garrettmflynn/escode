import * as button from "../../../../../../components/ui/button.js"
import * as start from "../../../../../../components/drafts/old/datastreams/components/start.js"
import * as average from "../../../../../../components/basic/average.js"
import * as threshold from "../../../../../../components/basic/threshold.js"
import * as muse from "../../../../../../components/drafts/old/devices/muse/index.js"

export const esDOM = {} as any
export const esListeners = {} as any

esListeners.threshold = 'average'
esListeners.average = 'datastreams'
esListeners.datastreams = "muse"
esListeners.muse = "button"

esDOM.average = {
    esCompose: average,
}


esDOM.threshold = {
    value: 300,
    esCompose: threshold,
}


esDOM.muse = {
    esCompose: muse,
}

const buttonElementConfig = button.esElement
buttonElementConfig.attributes.innerText = 'Connect Player 1'
buttonElementConfig.style = {
    'z-index': 100,
    position: 'absolute',
    top: '0',
    left: '0',
}

esDOM.button = {
    esElement: buttonElementConfig,
    esCompose: button,
}


esDOM.datastreams = {
    esCompose: start
}