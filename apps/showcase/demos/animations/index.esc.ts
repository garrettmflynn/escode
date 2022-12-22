import * as counterComponent from './components/counter.js'
import * as timestampComponent from './components/timestamp.js'
import * as timeComponent from './components/time.esc.js'

const interval = true

export const __attributes = {
    style: {
        margin: '25px'
    }
}

export const counter = {
    __compose: counterComponent,
    __animate: interval
}

export const timestamp = {
    __compose: timestampComponent,
    __animate: interval
}

export const count = {
    __element: 'p',
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

export const time = timeComponent


export const __listeners = {

    // To / From
    'count.span': {
        counter: true
    },

    'time.span': {
        timestamp: true
    }
}