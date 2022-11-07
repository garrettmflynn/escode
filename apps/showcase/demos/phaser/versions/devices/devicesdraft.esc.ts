
import * as multiplayer from './multiplayer.esc'

// import * as timeseries from '../../../../../components/drafts/old/timeseries/index.js'
// import { mode } from '../../../../../components/basic/keyboard'
import * as player1 from './playerconnect.esc'

// player2.__children.button.__element = button2ElementConfig

const model = multiplayer as any

model.__children.player1 = player1
// model.__children.player2 = player2

model.__listeners["game.player.jump"] = 'player1.threshold'
// model.__listeners['player2.threshold'] = "game.companion.jump"



// model.__children.button2 = {
//     __element: buttonElementConfig,
//     __compose: button,
// }

// const timeseriesElementConfig = timeseries.__element
// timeseriesElementConfig.style = {
//     position: "absolute",
//     bottom: "15px",
//     right: "15px",
//     width: "250px",
//     height: "150px",
//     "z-index": 100,
// }

// model.__children.timeseries = {
//    __element: timeseriesElementConfig,
//    __compose: timeseries
// }


export const __listeners = model.__listeners
export const __children = model.__children