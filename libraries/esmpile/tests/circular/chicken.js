import * as egg from './egg.js'
import message from './index.js'

export const string = 'chicken'

export default () => {
    message(string, egg.string)
}