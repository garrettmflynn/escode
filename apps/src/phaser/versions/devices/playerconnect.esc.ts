import * as buttonComponent from "../../../../../../js/components/ui/button.js"
import * as startComponent from "../../../../../../js/components/drafts/old/datastreams/components/start.js"
import * as averageComponent from "../../../../../../js/components/basic/average.js"
import * as thresholdComponent from "../../../../../../js/components/basic/threshold.js"
import * as museComponent from "../../../../../../js/components/drafts/old/devices/muse/index.js"

export const __listeners = {
    average: 'threshold',
    datastreams: 'average',
    must: "datastreams",
    button: "muse"
} as any

export const average = {
    __compose: averageComponent,
}


export const threshold = {
    value: 300,
    __compose: thresholdComponent,
}


export const muse = {
    __compose: museComponent,
}

export const button = {
    __attributes: {
        innerText: 'Connect Player 1',
        style: {
            'z-index': 100,
            position: 'absolute',
            top: '0',
            left: '0',
        }
    },
    __compose: buttonComponent,
}


export const datastreams = {
    __compose: startComponent
}