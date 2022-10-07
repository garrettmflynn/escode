import base from './base.js'

export function main() {

    // player walk animation
    this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNames("player", {
            prefix: "p1_walk",
            start: 1,
            end: 11,
            zeroPad: 2,
        }),
        frameRate: 10,
        repeat: -1,
        });
        // idle with only one frame, so repeat is not neaded
        this.anims.create({
        key: "idle",
        frames: [{ key: "player", frame: "p1_stand" }],
        frameRate: 10,
    });
}

function createMain(player) {

    base.call(this, player) // call base create function
    main.call(this, player) // call base create function


    // make the camera follow the player
    this.cameras.main.startFollow(player); // TODO: Move out

}


export default createMain