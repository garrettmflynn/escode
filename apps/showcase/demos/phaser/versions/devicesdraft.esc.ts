
import * as multiplayer from './multiplayer.esc'

// import * as timeseries from '../../../../../components/drafts/old/timeseries/index.js'
// import { mode } from '../../../../../components/basic/keyboard'
import * as player1 from './playerconnect.esc'

// player2.esDOM.button.esElement = button2ElementConfig

const model = multiplayer as any

model.esDOM.player1 = player1
// model.esDOM.player2 = player2

model.esListeners['player1.threshold'] = "game.player.jump"
// model.esListeners['player2.threshold'] = "game.companion.jump"



// model.esDOM.button2 = {
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

// model.esDOM.timeseries = {
//    esElement: timeseriesElementConfig,
//    esCompose: timeseries
// }


export const esListeners = model.esListeners
export const esDOM = model.esDOM