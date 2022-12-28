import * as selectComponent from '../select.js';
import * as buttonComponent from '../button.js';
import * as toggleComponent from '../../audio/toggle.js';

export const sounds = {
    __childposition: 0,
    __compose: selectComponent,
    options: []
}

export const button = {
    __childposition: 1,
    __compose: buttonComponent,
    __attributes: {
        innerText: "Play"
    }
}

export const toggle = {
    __compose:toggleComponent
}

export const __listeners = {
    button: {
        sounds: true
    },
    toggle: {
        button: true
    }
}