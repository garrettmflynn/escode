import * as test from 'esmpile/tests/basic/index.js'
import * as button from '../components/ui/button.js'
import * as log from '../libraries/escode/tests/0/components/log.js'
import * as ui from './ui'


const id = 'test'
const moveButtonId = 'button'

export const esComponents = {
    [id]: {
        esCompose: test,
        esListeners: {
            [`imports.nExecution`]: 'imports.passedWithListener',
            [`imports.passedWithListener`]: (...args) =>  console.log('Passed with Listener!', args),
        }
    }, 
    log: {
        esCompose: log
    },
    container: {
        componentToMove: moveButtonId,
        esCompose: {
            tagName: 'div'
        },
        log: {
            esCompose: log
        },
        esComponents: {
            header: {
                tagName: 'h1',
                attributes: {
                    innerText: 'ESCompose Demo'
                }
            },
            [moveButtonId]: {
                esCompose: button,
                esTrigger: {value: true, __internal: true}
            },
        },
        parentNode: ui.main
    }
}


export const esListeners = {
    [`container.${moveButtonId}`]: {
        [`${id}.imports`]: true,
        [`log`]: true,
    }
}
