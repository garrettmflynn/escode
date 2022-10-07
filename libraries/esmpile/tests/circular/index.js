import * as chicken from './chicken.js'
import * as egg from './egg.js'

export default (str1, str2) => {
    console.warn(`Which came first: the ${str1} or the ${str2}?`)
}

export {
    chicken,
    egg
}