
import * as timeseries from "../../../../components/ui/plot/timeseries/index.esc";
// import * as metrics from './components/engagement/dist/index.esm.js'
import * as metrics from './components/engagement/index.esc'

export const __attributes = {
    style: {
        padding: '25px',
        position: 'relative'
    }
}

const header = {
    __element: 'h1',
    __attributes: {
        innerText: 'Engagement Value'
    },
    // __compose: draggable
}



export const __children = {


    ui: {
        __children: {
            header, 

            now: {
                __element: 'p',
                __children: {
                    label: {
                        __element: 'b',
                        __attributes: {
                            innerText: 'Value: '
                        },
                    }, 
                    value: {
                        __element: 'span',
                        __attributes: {
                            innerText: 'N/A'
                        },
                    }
                }
            },

            average: {
                __element: 'p',
                __children: {
                    label: {
                        __element: 'b',
                        __attributes: {
                            innerText: 'Average: '
                        },
                    }, 
                    value: {
                        __element: 'span',
                        __attributes: {
                            innerText: 'N/A'
                        },
                    }
                }
            },

            // timeseries
        }
    },


    metrics

        
}


// Engagement: (Beta / (Alpha + Theta)) 
// Arousal: (BetaF3 + BetaF4) / (AlphaF3 + AlphaF4) 
// Valence: (AlphaF4 / BetaF4) - (AlphaF3 / BetaF3)


let buffer: number[] = []
const maxBufferTime = 1
let average = 0
const sum = (a,b) => a + b

export const __listeners = {
    'ui.now.value': 'metrics.calculations.engagement',
    // 'ui.timeseries.plot': 'metrics.calculations.engagement'


    // Declare an Arbitrary, User-Specified Callback
    '': {
        'metrics.calculations.engagement': function (value) {
            buffer.push(value)
            const maxSize = this.__children.metrics.__children.calculations.sps*maxBufferTime
            if (buffer.length > maxSize) buffer = buffer.slice(-maxSize)
            average = buffer.reduce(sum) / buffer.length

            // Set Average Value in DOM Element
            const el = document.getElementById('average')
            if (el) el.children[1].innerText = average.toString()
        }
    }
}