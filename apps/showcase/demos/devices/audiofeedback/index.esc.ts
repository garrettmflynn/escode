
const kalimba =  "./apps/showcase/demos/devices/assets/kalimba.wav"
const phonk =  "./apps/showcase/demos/devices/assets/phonk.wav"
const synthflute =  "./apps/showcase/demos/devices/assets/synthflute.wav"

import * as devices from "../../../../../components/ui/devices/index.esc"
import subprocesses from "./scripts/connect/subprocesses.js"
import onconnect from "./scripts/connect/onConnect.js"
import * as preprocess from  "../../../../../components/devices/heg/preprocess.js"

import * as audio from "../../../../../components/ui/audio/index.esc"
import button from "../../../../../components/ui/button"

import * as stats from  "../../../../../components/ui/devices/stats/index.js"

import * as waveform from "../../../../../components/ui/devices/heg/waveform.js"

// Local Components
import * as csvMenu from "../components/csvMenu.js"

export const esAttributes = {
    style: {
        position: 'relative',
        backgroundColor: "black",
        color: "white",
        fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
        width: "100%",
        height: "100%",
        overflow: "auto"
    },
}

export const esDOM = {
    overlay: {
        esAttributes: {
            style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width:'100%',
                height: '100%',
                zIndex: 1
            }
        },
        esDOM: {
            devices: {
                esCompose: devices,
                esDOM: {
                    connectmode: {
                        options: [
                            {
                                value: "BLE",
                                show: "selectBLE"
                            },
                            {
                                value: "USB",
                                show: "selectUSB"
                            },
                        ]
                    },
                    selectUSB: {
                        options: {
                            peanut: "Biocomp Peanut HEG",
                            hegduino: "HEGduino",
                            hegduinoV1: "HEGduino V1"
                        }
                    },
                    selectBLE: {
                        options: {
                            "hegduino":"HEGduino",
                            hegduinoV1: "HEGduino V1",
                            blueberry2: "Blueberry",
                            blueberry: "Blueberry_Legacy"
                        }
                    },
                    selectBLEOther: undefined,
                    selectOther: undefined,
                    connect: {
                        subprocesses,
                        onconnect
                    },
                    preprocessData: preprocess
                }
            },
            audio: {
                esCompose: audio,
                esDOM: {
                    sounds: {
                        options: [
                            {
                                label: "Kalimba",
                                value: kalimba
                            },
                            {
                                label: "Phonk",
                                value: phonk
                            },
                            {
                                label: "Synth Flute",
                                value: synthflute
                            }
                        ]
                    }
                }
            },
            stats: {
                esDOM: {
                    readout: {
                        esCompose: stats
                    },
                    reset: {
                        esCompose: button,
                        esAttributes: {
                            innerHTML: "Reset Stats"
                        }
                    },
                    csvmenu: {
                        esCompose: csvMenu
                    }
                }
            },
        }
    },

    // Main UI
    waveform: {
        esCompose: waveform,
        esAttributes: {
            style: {
                width:'100%',
                height: '100%',
            }
        }
    },
}

export const esListeners = {

    "waveform.webaudio": {
        "overlay.audio.toggle": true
    },

    "overlay.devices.preprocessData": {
        "overlay.devices.connect": true
    },

    "waveform.data": {
        "overlay.devices.preprocessData": true
    },

    "overlay.stats.readout.latest": {
        "overlay.devices.preprocessData": true
    },

    "overlay.devices.preprocessData.reset": {
        "overlay.stats.reset": true
    }
}