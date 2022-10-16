
import * as multiplayer from './multiplayer.esc'

import * as timeseries from '../../../../components/drafts/old/timeseries/index.js'
import { mode } from '../../../../components/basic/keys'
import * as player1 from './playerconnect.esc'

console.log('player1', player1)

// player2.esComponents.button.esElement = button2ElementConfig

const model = multiplayer as any

model.esComponents.player1 = player1
// model.esComponents.player2 = player2
console.log('model', model)

model.esListeners['player1.threshold'] = "game.player.jump"
// model.esListeners['player2.threshold'] = "game.companion.jump"



// model.esComponents.button2 = {
//     esElement: buttonElementConfig,
//     esCompose: button,
// }

// const timeseriesElementConfig = timeseries.esElement
// timeseriesElementConfig.style = {
//     position: "absolute",
//     bottom: "15px",
//     right: "15px",
//     width: "250px",
//     height: "150px",
//     "z-index": 100,
// }

// model.esComponents.timeseries = {
//    esElement: timeseriesElementConfig,
//    esCompose: timeseries
// }


export const esListeners = model.esListeners
export const esComponents = model.esComponents