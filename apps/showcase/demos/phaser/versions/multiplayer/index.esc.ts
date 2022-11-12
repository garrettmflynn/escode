import * as player from "../../../../../../components/phaser/player.js"
import update from "../../scripts/player/update.js"
import createCompanion from "../../scripts/player/create/companion.js"

import * as phaser from '../../index.esc'

export const __compose = phaser

export const __listeners = {

    // Companion Controls
    ['game.companion.jump']: {
        ['keys.w']: true
    },

    ['game.companion.velocity']: {
        ['keys.a']: {
            __branch: [
                { is: true, value: -200 },
                { is: false, value: 0 },
            ]
        },
        ['keys.d']: {
            __branch: [
                { is: true, value: 200 },
                { is: false, value: 0 },
            ]
        }
    }
}

export const __children = {
    game: {
        __children: {
            companion: {
                __compose: player,
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