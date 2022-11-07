import * as select from '../select.js';
import * as button from '../button.js';
import * as toggle from '../../audio/toggle.js';

export const __children = {
    sounds: {
        __compose: select,
        options: []
    },
    button: {
        __compose: button,
        __attributes: {
            innerText: "Play"
        }
    },
    toggle: {
        __compose:toggle
    }
}

export const __listeners = {
    button: {
        sounds: true
    },
    toggle: {
        button: true
    }
}