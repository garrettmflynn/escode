import * as test from '../../../../components/tests/basic/index.js'
import * as button from '../../../../components/ui/button.js'


const testURL = '../../../../components/tests/basic/index.js'
const buttonURL = '../../../../components/ui/button.js'

const testInfo = {
    url: testURL,
    reference: test
}

const buttonInfo = {
    url: buttonURL,
    reference: button
}

const id = 'test'
const buttonComponentId = 'button'

export const __attributes = {
    style: {
        margin: '25px'
    }
}

export const __children = {

    // INTERNAL NOT WORKING
    [id]: {
        __compose: testInfo.reference, // test
        __listeners: {
            'imports.passedWithListener': {
                'imports.nExecution': true
            },
            ['ARBITRARY']: {
                'imports.passedWithListener': (...args) =>  console.log('Passed with Listener!', args),
                'imports.later': (...args) =>  console.log('Added Later!', args)
            },
        }
    }, 
    container: {
        componentToMove: buttonComponentId,
        __compose: {
            __element: 'div'
        },
        __children: {
            p: {
                __element: 'p',
                __children: {
                    b: {
                        __element: 'b',
                        __attributes: {
                            innerText: 'Clicks: '
                        }
                    },
                    span: {
                        __element: 'span',
                        __attributes: {
                            innerText: '0'
                        }
                    },
                }
            },
            [buttonComponentId]: {
                __element: 'button',
                __compose: [

                    // Additional onmousedown Function
                    // TODO: Figure out how to include something like this...
                    {
                        __attributes: {
                            onmousedown: () => {
                                console.log('Calling me too!')
                            }
                        }
                    },

                    // Primary Button Component
                    buttonInfo.reference // button
                ],
                __trigger: {value: true, __internal: true}
            },
        },
    }
}


const branchConfig = {
    __branch: [
        {is: false, value: true}
    ]
}

export const __listeners = {

    // To / From
    [`${id}.imports`]: {
        [`container.${buttonComponentId}`]: branchConfig
    },

    [`container.p.span`]: {
        [`${id}.imports.nExecution`]: true
    }

    // // // From / To
    // [`container.${buttonComponentId}`]: {
    //     [`${id}.imports`]: branchConfig
    // },

    // [`${id}.imports.nExecution`]: {
    //     [`container.p.span`]: true
    // }
}
