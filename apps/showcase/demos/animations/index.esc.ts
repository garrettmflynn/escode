import * as counter from './components/counter.js'
import * as timestamp from './components/timestamp.js'

const interval = true

export const __attributes = {
    style: {
        margin: '25px'
    }
}

export const __children = {

    counter: {
        __compose: counter,
        __animate: interval
    }, 

    timestamp: {
        __compose: timestamp,
        __animate: interval
    }, 

    count: {
        __element: 'p',
        __children: {
            header: {
                __element: 'b',
                __attributes: {
                    innerText: 'Frames: '
                }
            },
            span: {
                __element: 'span',
            }
        }
    },

    time: {
        __element: 'p',
        __children: {
            header: {
                __element: 'b',
                __attributes: {
                    innerText: 'Time: '
                }
            },
            span: {
                __element: 'span',
            }
        }
    }
}


export const __listeners = {
    'count.span': {
        counter: true
    },

    'time.span': {
        timestamp: true
    }
}