import main from '../../js/components/demos/phaser/index.esc.json' assert {type: "json"}
import mainPkg from '../../js/components/package.json'  assert {type: "json"}
import * as game from  '../../js/components/components/phaser/game/index.js'
import * as cursors from  '../../js/components/components/phaser/cursors.js'
import * as player from  "../../js/components/components/phaser/player.js"

import * as create from  '../../js/components/demos/phaser/scripts/create.js'
import * as createMain from  '../../js/components/demos/phaser/scripts/player/create/main.js'
import * as createCompanion from  '../../js/components/demos/phaser/scripts/player/create/companion.js'

import * as updatePlayer from "../../js/components/demos/phaser/scripts/player/update.js"

const options = {
    filesystem: {
        'package.json': mainPkg,
        'components/phaser/game/index.js': game,
        'components/phaser/player.js': player,
        'components/phaser/cursors.js': cursors,
        'scripts/create.js': create,
        'scripts/player/create/main.js': createMain,
        'scripts/player/create/companion.js': createCompanion,
        'scripts/player/update.js': updatePlayer,
    }
}

const path = ''


export {
    path,
    main,
    options
}