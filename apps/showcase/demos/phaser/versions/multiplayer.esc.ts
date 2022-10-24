import * as player from  "../../../../../components/phaser/player.js"
import update from "../scripts/player/update.js"
import createCompanion from "../scripts/player/create/companion.js"
// import equals from "../../../../components/basic/equals.js"

import * as phaser from '../index.esc'

const model = Object.assign({}, phaser) as any
model.esDOM = Object.assign({}, model.esDOM) as any
model.esDOM.game = Object.assign({}, model.esDOM.game) as any
model.esDOM.game.esDOM = Object.assign({}, model.esDOM.game.esDOM) as any

export const esListeners = Object.assign({}, model.esListeners)
Object.assign(esListeners, {

    // Companion Controls
    ['keys.w']: {
        ['game.companion.jump']: true,
    },
    ['keys.a']: {
        ['game.companion.velocity']: {
            esBranch: [
                {equals: true, value: -200},
                {equals: false, value: 0},
            ]
        }
    },
    ['keys.d']: {
        ['game.companion.velocity']: {
            esBranch: [
                {equals: true, value: 200},
                {equals: false, value: 0},
            ]
        }
    }
})

model.esDOM.game.esDOM.companion = {
    esCompose: player,
    position: {
        x: 100,
        y: 200
    },
    size: {
        offset: {
            height: -8
        }
    },
    bounce: 0.2,
    collideWorldBounds: false,
    create: createCompanion,
    update
}

export const esDOM = model.esDOM