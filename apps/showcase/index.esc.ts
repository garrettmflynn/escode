import * as test from '../../components/tests/basic/index.js'
import * as button from '../../components/ui/button.js'
import * as log from '../../components/basic/log.js'

const id = 'test'
const moveButtonId = 'button'

export const esElement = 'div'

export const esStyle = {
    padding: '50px'
}

export const esComponents = {

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
        componentToMove: moveButtonId,
        esCompose: {
            esElement: 'div'
        },
        log: {
            esCompose: log
        },
        esComponents: {
            header: {
                esElement: {
                    element: 'h1',
                    attributes: {
                        innerText: 'ESCode Demo'
                    }
                }
            },
            [moveButtonId]: {
                esCompose: button,
                esTrigger: {value: true, __internal: true}
            },
        },
    }
}


export const esListeners = {
    [`container.${moveButtonId}`]: {
        [`${id}.imports`]: true,
        [`log`]: true,
    }
}
