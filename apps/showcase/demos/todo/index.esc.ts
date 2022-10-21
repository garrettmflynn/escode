import * as list from  "../../../../components/ui/ul.js"
import * as input from "../../../../components/ui/input.js"
import * as button from  "../../../../components/ui/button.js"
import * as store from  "../../../../components/storage/local/set.js"
import * as load from  "../../../../components/storage/local/get.js"

import onSubmit from  "./scripts/onSubmit.js"

let buttonComponent = Object.assign({}, button) as any
buttonComponent.esElement.attributes.innerHTML = "Add Todo"
buttonComponent.esElement.attributes.type = "submit"

export const esComponents = {
        list: {
            esCompose: list
        },
        form: {
            esElement: {
                element: 'form',
                attributes: {
                    onsubmit: onSubmit 
                }
            },
            esComponents: {
                input: {
                    esCompose: input
                },
                button: buttonComponent
                // button: {
                //     esElement: {
                //         element: 'button',
                //         attributes: {
                //             innerHTML: "Add Todo",
                //             type: "submit"
                //         }
                //     },
                //     esCompose: button
                // },
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
    load: {
        list: true
    },
    ['form.input']: {
        ['form.button']: true,
    },
    ['form.button']: {
        list: true
    },
    list: {
        store: {
            esFormat: (value) => [value, 'todos']
        }
    }
}
