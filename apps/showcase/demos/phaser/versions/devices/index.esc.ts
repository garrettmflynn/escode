
import * as phaser from '../../index.esc'
import * as average from "../../../../../../components/basic/average.js"
import * as threshold from "../../../../../../components/basic/threshold.js"
import * as button from "../../../../../../components/ui/button.js"
import * as start from "../../../../../../components/drafts/old/datastreams/components/start.js"
import * as muse from "../../../../../../components/drafts/old/devices/muse/index.js"
import * as signal from "../../../signal/index.esc"

// ----------------------------- Base Component -----------------------------
export const esCompose = phaser


// ----------------------------- Will Merge In -----------------------------
export const esAttributes = { style: { position: 'relative' } }

export const esListeners = {
    ['game.player.jump']: {
        threshold: true
    },
    threshold: 'average',
    average: {
        datastreams: true
    },
    ['signal.plotter']: {
        datastreams: {
            esFormat: (args) => { 
                if (args) return {[args[2]]: args[0]} 
            }
        }
    },
    datastreams: 'muse',
    muse: 'button'
}

export const esDOM = {

    // ---------- Blink Detector ----------
    average: {
        maxBufferSize: 100,
        buffer: [],
        esCompose: average,
    },
    threshold: {
        value: 300,
        esCompose: threshold,
    },

    // ---------- Devices ----------
    // synthetic: {
    //     esCompose: synthetic,
    // },
    // ganglion: {
    //     esCompose: ganglion,
    // },
    muse: {
        esCompose: muse,
    },

    button: {
        esElement: 'button',
        esAttributes: {
            innerText: 'Connect Muse',
            style: {
                zIndex: 100,
                position: 'absolute',
                top: '0',
                left: '0',
            }
        },
        esCompose: button,
    },

    signal: {
        esCompose: signal,
        esAttributes: {
            style: {
                position: "absolute",
                bottom: "15px",
                right: "15px",
                width: "250px",
                height: "150px",
                zIndex: 1,
            }
        },

        esDOM: {
            signalCanvas: {
                width: '100%',
                height: '150px',
            },
            overlayCanvas: {
                width: '100%',
                height: '150px',
            },
            plotter: {        
                options: {
                    lineWidth: undefined,
                }
            },
            data: undefined // remove data generator
        },
        esListeners: {
            'plotter': undefined
        }
    },

    datastreams: {
        esCompose: start,
    },
}

// {
//     "esDOM": {
//         "average": {
//             "esCompose": "../../../plugins/average.js",
//             "children": {
//                 "threshold": true
//             }
//         },
//         "threshold": {
//             "esCompose": "../../../plugins/threshold.js",
//             "threshold": 500,
//             "children": {
//                 "ui.game.player.jump": true
//             }
//         },
//         "synthetic": {
//             "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/drafts/old/devices/synthetic/index.js",
//             "children": {
//                 "datastreams.start": true
//             }
//         },
//         "ganglion": {
//             "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/drafts/old/devices/ganglion/index.js",
//             "children": {
//                 "datastreams.start": true
//             }
//         },
//         "muse": {
//             "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/drafts/old/devices/muse/index.js",
//             "children": {
//                 "datastreams.start": true
//             }
//         },
//         "datastreams": {
//             "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/drafts/old/datastreams/index.esc.json",
//             "children": {
//                 "ui.timeseries": true,
//                 "average": true
//             }
//         },
//         "ui": {
//             "tagName": "div",
//             "style": {
//                 "position": "absolute",
//                 "top": "0px",
//                 "left": "0px",
//                 "width": "100%",
//                 "height": "100%"
//             },
//             "esDOM": {
//                 "timeseries": {
//                     "style": {
//                         "position": "absolute",
//                         "bottom": "15px",
//                         "right": "15px",
//                         "width": "250px",
//                         "height": "150px"
//                     },
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/drafts/old/timeseries/index.js"
//                 },
//                 "button_1": {
//                     "attributes": {
//                         "innerHTML": "Start synthetic data generation"
//                     },
//                     "children": {
//                         "synthetic": true
//                     },
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/ui/button.js"
//                 },
//                 "button_2": {
//                     "attributes": {
//                         "innerHTML": "Connect Ganglion"
//                     },
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/ui/button.js",
//                     "children": {
//                         "ganglion": true
//                     }
//                 },
//                 "button_3": {
//                     "attributes": {
//                         "innerHTML": "Connect Muse"
//                     },
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/ui/button.js",
//                     "children": {
//                         "muse": true
//                     }
//                 },
//                 "jump": {
//                     "attributes": {
//                         "innerHTML": "Jump Main Character"
//                     },
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/ui/button.js",
//                     "children": {
//                         "ui.game.player.jump": true
//                     }
//                 },
//                 "companionJump": {
//                     "attributes": {
//                         "innerHTML": "Jump Companion"
//                     },
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/ui/button.js",
//                     "children": {
//                         "ui.game.companion.jump": true
//                     }
//                 },
//                 "game": {
//                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/phaser/game/index.js",
//                             "preload": {
//                                 "setBaseURL": "https://raw.githubusercontent.com/brainsatplay/escode/main/apps/showcase/demos/phaser/assets",
//                                 "tilemapTiledJSON": [
//                                     [
//                                         "map",
//                                         "map.json"
//                                     ]
//                                 ],
//                                 "spritesheet": [
//                                     [
//                                         "tiles",
//                                         "tiles.png",
//                                         {
//                                             "frameWidth": 70,
//                                             "frameHeight": 70
//                                         }
//                                     ]
//                                 ],
//                                 "image": [
//                                     [
//                                         "coin",
//                                         "coinGold.png"
//                                     ]
//                                 ],
//                                 "atlas": [
//                                     [
//                                         "player",
//                                         "player.png",
//                                         "player.json"
//                                     ]
//                                 ]
//                             },
//                             "config": {
//                                 "physics": {
//                                     "default": "arcade",
//                                     "arcade": {
//                                         "gravity": {
//                                             "y": 500
//                                         }
//                                     }
//                                 },
//                                 "scene": {
//                                     "key": "main",
//                                     "create": {
//                                         "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/drafts/demos/phaser/scripts/create.js"
//                                     }
//                                 }
//                             },
//                             "esDOM": {
//                                 "cursors": {
//                                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/phaser/cursors.js"
//                                 },
//                                 "player": {
//                                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/phaser/player.js",
//                                     "position": {
//                                         "x": 200,
//                                         "y": 200
//                                     },
//                                     "size": {
//                                         "offset": {
//                                             "height": -8
//                                         }
//                                     },
//                                     "bounce": 0.2,
//                                     "collideWorldBounds": false,
//                                     "create": {
//                                         "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/drafts/demos/phaser/scripts/player/create/main.js"
//                                     },
//                                     "update": {
//                                         "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/drafts/demos/phaser/scripts/player/update.js"
//                                     }
//                                 },
//                                 "companion": {
//                                     "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/components/phaser/player.js",
//                                     "position": {
//                                         "x": 100,
//                                         "y": 200
//                                     },
//                                     "size": {
//                                         "offset": {
//                                             "height": -8
//                                         }
//                                     },
//                                     "bounce": 0.2,
//                                     "collideWorldBounds": false,
//                                     "create": {
//                                         "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/drafts/demos/phaser/scripts/player/create/companion.js"
//                                     },
//                                     "update": {
//                                         "esCompose": "https://raw.githubusercontent.com/brainsatplay/escode/main/drafts/demos/phaser/scripts/player/update.js"
//                                     }
//                                 }
//                             }
//                         }
//             }
//         }
//     },
    
//     "listeners": {
//         "datastreams.start": {
//             "ui.timeseries": true,
//             "average": true
//         }
//     }
// }