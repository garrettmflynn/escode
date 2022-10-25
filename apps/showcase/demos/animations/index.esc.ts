import * as counter from './components/counter.js'
import * as timestamp from './components/timestamp.js'

const interval = true

export const esDOM = {

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
        esDOM: {
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
        esDOM: {
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
    'count.span': {
        counter: true
    },

    'time.span': {
        timestamp: true
    }
}