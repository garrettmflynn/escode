
// -------------- Import Modules --------------
import * as reference from './index.esc.js'
import * as about from './about.esc.js'

import Router from '../../libraries/drafts/router'

const router = new Router({spa: true, element: { root: document.body, target: '#content'}})
router.setRoot(reference)
router.set('about', about)
router.load() // Load root component