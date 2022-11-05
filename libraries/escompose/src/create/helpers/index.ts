import basicStart from './start'
import stop from './stop'

import animate from './animate'


function start(keys) {
    return basicStart.call(this, keys, [
        function () { animate.call(this, keys)}
    ])
}

export {
    start,
    stop
}
