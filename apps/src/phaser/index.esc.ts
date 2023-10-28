import * as gameComponent from "../../../js/components/phaser/game/index.js"
import * as player from "../../../js/components/phaser/player.js"
import createMain from "./scripts/player/create/main.js"
import update from "./scripts/player/update.js"
import create from "./scripts/create.js"
import * as keysComponent from "../../../js/components/basic/keyboard.js"

export const __attributes = {
    style: {
        width: '100%',
        height: '100%',
    }
}

export const keys = {
    __compose: keysComponent
}

export const game = {

    __attributes: {
        style: {
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        }
    },

    __compose: gameComponent,
    preload: {
        setBaseURL: "https://raw.githubusercontent.com/brainsatplay/escode/main/apps/src/phaser/assets",
        tilemapTiledJSON: [
            [
                "map",
                "map.json"
            ]
        ],
        spritesheet: [
            [
                "tiles",
                "tiles.png",
                {
                    frameWidth: 70,
                    frameHeight: 70
                }
            ]
        ],
        image: [
            [
                "coin",
                "coinGold.png"
            ]
        ],
        atlas: [
            [
                "player",
                "player.png",
                "player.json"
            ]
        ]
    },
    config: {
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 500
                }
            }
        },
        scene: {
            key: "main",
            create: create
            // {
            //     __compose: create
            // }
        }
    },
    player: {
        __compose: player,
        position: {
            x: 200,
            y: 200
        },
        size: {
            offset: {
                height: -8
            }
        },
        bounce: 0.2,
        collideWorldBounds: false,
        create: createMain,
        // {
        //     __compose: createMain
        // },
        update: update
        // {
        //     __compose: update
        // }
    }
}

export const __listeners = {

    // Main Player Controls
    ['game.player.jump']: {
        ['keys.ArrowUp']: true
    },

    ['game.player.velocity']: {

        ['keys.ArrowLeft']: {
            __branch: [
                { is: true, value: -150 },
                { is: false, value: 0 },
            ]
        },

        ['keys.ArrowRight']: {
            __branch: [
                { is: true, value: 150 },
                { is: false, value: 0 },
            ]
        }
    }
}