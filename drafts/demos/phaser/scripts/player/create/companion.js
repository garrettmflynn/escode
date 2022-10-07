import base from './base.js'
import { main } from './main.js'

function createCompanion(player) {

    base.call(this, player) // call base create function
    main.call(this, player) // call main create function (no follow)

    // Half Size
    player.setDisplaySize(4*player.width / 6, 4* player.height / 6); 

}

export default createCompanion