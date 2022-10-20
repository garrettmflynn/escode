import * as select from  "../../../../../components/ui/select.js"
import * as button from "../../../../../components/ui/button.js"
import * as toggle from  "../../../../../components/audio/toggle.js"
// import kalimba from  "../assets/kalimba.wav"
// import update from "./scripts/player/update.js"
// import create from "./scripts/create.js"

export const tagName = "div"
export const esComponents = {
        sounds: {
            esCompose: select,
            options: [
                {
                    label: "Kalimba",
                    value: {
                        esCompose: "../assets/kalimba.wav"
                    }
                },
                {
                    label: "Phonk",
                    value: {
                        esCompose: "../assets/phonk.wav"
                    }
                },
                {
                    label: "Synth Flute",
                    value: {
                        esCompose: "../assets/synthflute.wav"
                    }
                }
            ]
        },
        button: {
            esCompose: button,
            innerText: "Play"
        },
        toggle: {
            esCompose: toggle
        }
}

export const esListeners = {
    sounds: {
        button: true
    },
    button: {
        toggle: true
    }
}