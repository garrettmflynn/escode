import * as game from  "../../../components/phaser/game/index.js"
import * as cursors from "../../../components/phaser/cursors.js"
import * as player from  "../../../components/phaser/player.js"
import createMain from  "./scripts/player/create/main.js"
import update from "./scripts/player/update.js"
import create from "./scripts/create.js"

export const esComponents = {
    game: {
        esCompose: game,
        preload: {
            setBaseURL: "https://raw.githubusercontent.com/brainsatplay/components/main/demos/phaser/assets",
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
                //     esCompose: create
                // }
            }
        },
        esComponents: {
            cursors: {
                esCompose: cursors
            },
            player: {
                esCompose: player,
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
                //     esCompose: createMain
                // },
                update: update 
                // {
                //     esCompose: update
                // }
            }
        }
    }
}