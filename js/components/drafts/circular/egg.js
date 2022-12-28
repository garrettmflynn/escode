import * as chicken from './chicken.js'
import message from './index.js'

export const string = 'egg'

export default () => {
    message(string, chicken.string)
}