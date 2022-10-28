import * as player from "../../../../../../components/phaser/player.js"
import update from "../../scripts/player/update.js"
import createCompanion from "../../scripts/player/create/companion.js"
// import equals from "../../../../components/basic/equals.js"

import * as phaser from '../../index.esc'

export const esCompose = phaser

export const esListeners = {

    // Companion Controls
    ['game.companion.jump']: {
        ['keys.w']: true
    },

    ['game.companion.velocity']: {
        ['keys.a']: {
            esBranch: [
                { equals: true, value: -200 },
                { equals: false, value: 0 },
            ]
        },
        ['keys.d']: {
            esBranch: [
                { equals: true, value: 200 },
                { equals: false, value: 0 },
            ]
        }
    }

}

export const esDOM = {
    game: {
        esDOM: {
            companion: {
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
        }
    }
}