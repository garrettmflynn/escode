import * as list from  "../../../components/ui/button.js"
import * as input from "../../../components/ui/input.js"
import * as button from  "../../../components/phaser/player.js"
import * as store from  "../../../components/storage/local/set.js"
import * as load from  "../../../components/storage/local/get.js"

import onSubmit from  "./scripts/onSubmit.js"


export const esComponents = {
        list: {
            esCompose: list
        },
        form: {
            tagName: "form",
            attributes: {
                onsubmit: onSubmit 
                // {
                //     esCompose: "./scripts/onSubmit.js"
                // }
            },
            esComponents: {}
        },
        input: {
            esCompose: input
        },
        button: {
            attributes: {
                innerHTML: "Add Todo",
                type: "submit"
            },
            esCompose: button
        },
        store: {
            esCompose: store
        },
        load: {
            arguments: {
                key: "todos"
            },
            esCompose: load
        }
    }
export const esListeners = {
    load: {
        list: true
    },
    input: {
        button: true
    },
    button: {
        log: true,
        list: true
    },
    list: {
        store: true
    }
}
