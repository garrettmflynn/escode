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
            'imports.passedWithListener': `imports.nExecution`,
            ['ARBITRARY']: {
                'imports.passedWithListener': (...args) =>  console.log('Passed with Listener!', args),
                'imports.later': (...args) =>  console.log('Added Later!', args)
            },
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


export const esListeners = {
    [`${id}.imports`]: {
        [`container.${buttonComponentId}`]: {
            esBranch: [
                {equals: true, value: true}
            ]
        }
    },

    [`container.p.span`]: {
        [`${id}.imports.nExecution`]: true
    }

    // log: {
    //     [`container.${buttonComponentId}`]: true
    // }
}
