import * as select from '../select.js';
import * as button from '../button.js';
import * as toggle from '../../audio/toggle.js';

export const esDOM = {
    sounds: {
        esCompose: select,
        options: []
    },
    button: {
        esCompose: button,
        esAttributes: {
            innerText: "Play"
        }
    },
    toggle: {
        esCompose:toggle
    }
}

export const esListeners = {
    button: {
        sounds: true
    },
    toggle: {
        button: true
    }
}