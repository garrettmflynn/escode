import * as list from  "../../../../components/ui/ul.js"
import * as input from "../../../../components/ui/input.js"
import * as removable from "../../../../components/ui/behaviors/removable.js"

import * as button from  "../../../../components/ui/button.js"
import * as store from  "../../../../components/storage/local/set.js"
import * as load from  "../../../../components/storage/local/get.js"
import * as remove from  "../../../../components/storage/local/remove.js"

import * as onSubmit from  "./components/onSubmit.esc.js"


export const __attributes = {
    style: {
        margin: '25px'
    }
}

export const __define = {
    listItem: {
        __element: {
            name: 'es-removable-list-item',
            extends: 'li',
        },
        __compose: removable
    }
}

export const __children = {
        item: {
            __element: 'es-removable-list-item'
        },

        list: {
            itemType: 'es-removable-list-item',
            __element: 'ul',
            __compose: list
        },
        form: {
            __element: 'form',
            __compose: onSubmit,
            __children: {
                input: {
                    __element: 'input',
                    __attributes: {
                        placeholder: 'Write your todo here'
                    },
                    __compose: input
                },
                button: {
                    __element: 'button',
                    __attributes: {
                        type: 'submit',
                        innerHTML: 'Add Todo'
                    },
                    __compose: button
                }
            }
        },

        clearButton: {
            __element: 'button',
            __attributes: {
                innerHTML: 'Clear List'
            },
            __compose: button
        },

        store: {
            __compose: store
        },
        remove: {
            __compose: remove
        },
        load: {
            __trigger: ["todos"],
            __compose: load
        }
    }
export const __listeners = {

    list: {
        load: true,
        ['form.button']: {
            __branch: [
                {if: (input) => typeof input === 'string'},
            ]
        },
        ['remove']: true
    },

    ['form.button']: {
        ['form.input']: true
    },

    ['form.input']: {
        ['form.button']: {
            __branch: [
                {if: (input) => typeof input === 'string', value: ''},
            ]
        }
    },

    ['remove']: {
        ['clearButton']: {
            __format: () => 'todos'
        }
    },

    store: {
        list: {
            __format: (value) => [value, 'todos']
        }
    }
    
}
