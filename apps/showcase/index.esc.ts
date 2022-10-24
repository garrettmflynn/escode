import * as test from '../../components/tests/basic/index.js'
import * as button from '../../components/ui/button.js'
import * as log from '../../components/basic/log.js'

const id = 'test'
const buttonComponentId = 'button'

export const esAttributes = {
    style: {
        padding: '50px'
    }
}

export const esDOM = {

    [id]: {
        esCompose: test,
        esListeners: {
            [`imports.nExecution`]: 'imports.passedWithListener',
            [`imports.passedWithListener`]: (...args) =>  console.log('Passed with Listener!', args),
            [`imports.later`]: (...args) =>  console.log('Added Later!', args),
        }
    }, 
    log: {
        esCompose: log
    },
    container: {
        componentToMove: buttonComponentId,
        esCompose: {
            esElement: 'div'
        },
        log: {
            esCompose: log
        },
        esDOM: {
            header: {
                esElement: 'h1',
                esAttributes: {
                    innerText: 'ESCode Demo'
                }
            },
            [buttonComponentId]: {
                esElement: 'button',
                esCompose: button,
                esTrigger: {value: true, __internal: true}
            },
        },
    }
}


export const esListeners = {
    [`container.${buttonComponentId}`]: {
        [`${id}.imports`]: true,
        [`log`]: true,
    }
}
