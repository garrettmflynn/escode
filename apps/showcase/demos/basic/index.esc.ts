import * as test from '../../../../components/tests/basic/index.js'
import * as button from '../../../../components/ui/button.js'

const id = 'test'
const buttonComponentId = 'button'

export const esDOM = {

    [id]: {
        esCompose: test,
        esListeners: {
            'imports.passedWithListener': `imports.nExecution`,
            ['ARBITRARY']: {
                'imports.passedWithListener': (...args) =>  console.log('Passed with Listener!', args),
                'imports.later': (...args) =>  console.log('Added Later!', args)
            },
        }
    }, 
    container: {
        componentToMove: buttonComponentId,
        esCompose: {
            esElement: 'div'
        },
        esDOM: {
            p: {
                esElement: 'p',
                esDOM: {
                    b: {
                        esElement: 'b',
                        esAttributes: {
                            innerText: 'Clicks: '
                        }
                    },
                    span: {
                        esElement: 'span',
                        esAttributes: {
                            innerText: '0'
                        }
                    },
                }
            },
            [buttonComponentId]: {
                esElement: 'button',
                esCompose: [

                    // Additional onmousedown Function
                    {
                        esAttributes: {
                            onmousedown: () => {
                                console.log('Calling me too!')
                            }
                        }
                    },

                    // Primary Button Component
                    button
                ],
                esTrigger: {value: true, __internal: true}
            },
        },
    }
}


const branchConfig = {
    esBranch: [
        {equals: false, value: true}
    ]
}

export const esListeners = {
    [`${id}.imports`]: {
        [`container.${buttonComponentId}`]: branchConfig
    },

    [`container.p.span`]: {
        [`${id}.imports.nExecution`]: true
    }
}
