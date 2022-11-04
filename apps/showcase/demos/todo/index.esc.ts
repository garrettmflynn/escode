import * as list from  "../../../../components/ui/ul.js"
import * as input from "../../../../components/ui/input.js"
import * as removable from "../../../../components/ui/behaviors/removable.js"

import * as button from  "../../../../components/ui/button.js"
import * as store from  "../../../../components/storage/local/set.js"
import * as load from  "../../../../components/storage/local/get.js"
import * as remove from  "../../../../components/storage/local/remove.js"

import onSubmit from  "./scripts/onSubmit.js"


export const esAttributes = {
    style: {
        margin: '25px'
    }
}

export const esComponents = {
    listItem: {
        esElement: {
            name: 'es-removable-list-item',
            extends: 'li',
        },
        esCompose: removable
    }
}

export const esDOM = {

        list: {
            itemType: 'es-removable-list-item',
            esElement: 'ul',
            esCompose: list
        },
        form: {
            esElement: 'form',
            esAttributes: {
                onsubmit: onSubmit 
            },
            esDOM: {
                input: {
                    esElement: 'input',
                    esAttributes: {
                        placeholder: 'Write your todo here'
                    },
                    esCompose: input
                },
                button: {
                    esElement: 'button',
                    esAttributes: {
                        type: 'submit',
                        innerHTML: 'Add Todo'
                    },
                    esCompose: button
                }
            }
        },

        clearButton: {
            esElement: 'button',
            esAttributes: {
                innerHTML: 'Clear List'
            },
            esCompose: button
        },

        store: {
            esCompose: store
        },
        remove: {
            esCompose: remove
        },
        load: {
            esTrigger: ["todos"],
            esCompose: load
        }
    }
export const esListeners = {

    list: {
        load: true,
        ['form.button']: {
            esBranch: [
                {condition: (input) => typeof input === 'string'},
            ]
        },
        ['remove']: true
    },

    ['form.button']: {
        ['form.input']: true
    },

    ['form.input']: {
        ['form.button']: {
            esBranch: [
                {condition: (input) => typeof input === 'string', value: ''},
            ]
        }
    },

    ['remove']: {
        ['clearButton']: {
            esFormat: () => 'todos'
        }
    },

    store: {
        list: {
            esFormat: (value) => [value, 'todos']
        }
    }
    
}
