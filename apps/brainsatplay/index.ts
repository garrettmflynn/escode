
// -------------- Import Modules --------------
import * as reference from './index.esc.js'
import * as about from './about.esc.js'
import * as work from './work.esc.js'

import Router from '../../packages/drafts/router'

const router = new Router({spa: true, element: { root: document.body, target: '#content'}})
router.setRoot(reference)
router.set('about', about)
router.set('work', work)

router.load() // Load root component