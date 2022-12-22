import * as listComponent from "../../../../components/ui/ul.js"

import * as inputComponent from "../../../../components/ui/input.js"
import * as removableComponent from "../../../../components/ui/behaviors/removable.js"

import * as buttonComponent from "../../../../components/ui/button.js"
import * as storeComponent from "../../../../components/storage/local/set.js"
import * as loadComponent from "../../../../components/storage/local/get.js"
import * as removeComponent from "../../../../components/storage/local/remove.js"

import * as onSubmit from "./components/onSubmit.esc.js"

import * as thisList from "./components/listObject.esc"


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
        __compose: removableComponent
    }
}

export const list = thisList // listComponent

export const form = {
    __element: 'form',
    __childposition: 1,
    __compose: onSubmit,
    input: {
        __element: 'input',
        __attributes: {
            placeholder: 'Write your todo here'
        },
        __compose: inputComponent
    },
    button: {
        __element: 'button',
        __attributes: {
            type: 'submit',
            innerHTML: 'Add Todo'
        },
        __compose: buttonComponent
    }
}

export const clearButton = {
    __element: 'button',
    __childposition: 2,
    __attributes: {
        innerHTML: 'Clear List'
    },
    __compose: buttonComponent
}

export const store = {
    __compose: storeComponent
}

export const remove = {
    __compose: removeComponent
}

export const load = {
    __trigger: ["todos"],
    __compose: loadComponent
}

export const __listeners = {

    list: {
        load: true,
        ['form.button']: {
            __branch: [
                { if: (input) => typeof input === 'string' },
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
                { if: (input) => typeof input === 'string', value: '' },
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
