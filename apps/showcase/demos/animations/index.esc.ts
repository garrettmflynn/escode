import * as counter from './components/counter.js'
import * as timestamp from './components/timestamp.js'

const interval = true

export const esComponents = {

    counter: {
        esCompose: counter,
        esAnimate: interval
    }, 

    timestamp: {
        esCompose: timestamp,
        esAnimate: interval
    }, 

    count: {
        esElement: 'p',
        esComponents: {
            header: {
                esElement: 'b',
                esAttributes: {
                    innerText: 'Frames: '
                }
            },
            span: {
                esElement: 'span',
            }
        }
    },

    time: {
        esElement: 'p',
        esComponents: {
            header: {
                esElement: 'b',
                esAttributes: {
                    innerText: 'Time: '
                }
            },
            span: {
                esElement: 'span',
            }
        }
    }
}


export const esListeners = {
    [`counter`]: {
        'count.span.esElement.innerText': true,
    },

    [`timestamp`]: {
        'time.span.esElement.innerText': true,
    },
}