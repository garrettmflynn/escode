import * as list from  "../../../../components/ui/ul.js"
import * as input from "../../../../components/ui/input.js"
import * as removable from "../../../../components/ui/behaviors/removable.js"

import * as button from  "../../../../components/ui/button.js"
import * as store from  "../../../../components/storage/local/set.js"
import * as load from  "../../../../components/storage/local/get.js"

import onSubmit from  "./scripts/onSubmit.js"

const buttonAttributes = Object.assign({}, button.esAttributes) as any
buttonAttributes.innerHTML = "Add Todo"
buttonAttributes.type = "submit"

const inputAttributes = Object.assign({}, input.esAttributes) as any
inputAttributes.placeholder = 'Write your todo here'

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
                    esAttributes: inputAttributes,
                    esCompose: input
                },
                button: {
                    esElement: 'button',
                    esAttributes: buttonAttributes,
                    esCompose: button
                }
            }
        },
        store: {
            esCompose: store
        },
        load: {
            esTrigger: ["todos"],
            esCompose: load
        }
    }
export const esListeners = {

    list: {
        load: true,
        ['form.button']: true
    },

    ['form.button']: {
        ['form.input']: true
    },

    store: {
        list: {
            esFormat: (value) => [value, 'todos']
        }
    }
    
}
