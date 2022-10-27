
import * as multiplayer from '../multiplayer/index.esc'
import * as average from "../../../../../../components/basic/average.js"
import * as threshold from "../../../../../../components/basic/threshold.js"
import * as button from "../../../../../../components/ui/button.js"
import * as timeseries from '../../../../../../components/drafts/old/timeseries/index.js'
import * as start from "../../../../../../components/drafts/old/datastreams/components/start.js"
import * as muse from "../../../../../../components/drafts/old/devices/muse/index.js"


const model = Object.assign({}, multiplayer) as any
model.esDOM = Object.assign({}, model.esDOM) as any
model.esDOM.game = Object.assign({}, model.esDOM.game) as any
model.esDOM.game.esDOM = Object.assign({}, model.esDOM.game.esDOM) as any
model.esListeners = Object.assign({}, model.esListeners) as any

model.esListeners.threshold = 'average'
model.esListeners["game.companion.jump"].threshold = true

model.esListeners.average = {
    datastreams: true
}

model.esListeners.timeseries = {
    datastreams: true
}

model.esListeners.datastreams = 'muse'

model.esListeners.muse = 'button'

model.esDOM.average = {
    maxBufferSize: 100,
    buffer: [],
    esCompose: average,
}

model.esDOM.threshold = {
    value: 300,
    esCompose: threshold,
}

// model.esDOM.synthetic = average
// model.esDOM.ganglion = average
model.esDOM.muse = {
    esCompose: muse,
}

const buttonAttributes = {} as any
buttonAttributes.innerText = 'Connect Muse'
buttonAttributes.style = {
    zIndex: 100,
    position: 'absolute',
    top: '0',
    left: '0',
}

model.esDOM.button = {
    esElement: 'button',
    esAttributes: buttonAttributes,
    esCompose: button,
}

const timeseriesAttributes = Object.assign({}, timeseries.esAttributes)
timeseriesAttributes.style = {
    position: "absolute",
    bottom: "15px",
    right: "15px",
    width: "250px",
    height: "150px",
    "z-index": 100,
}

model.esDOM.timeseries = {
   esElement: 'div',
   esAttributes: timeseriesAttributes,
   esCompose: timeseries
}

model.esDOM.datastreams = {
    esCompose: start
}

export const esAttributes = Object.assign(Object.assign({}, model.esAttributes), { style: { position: 'relative' }})
export const esListeners = model.esListeners
export const esDOM = model.esDOM

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