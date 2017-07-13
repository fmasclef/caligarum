/**
 * Basic authentication test controller
 */

var
  router = express.Router(),
  path   = require('path')

router.use(jwtAuth())

/**
 * Test route.
 */
router.get('/', function(req, res, next) {
  res.json({
    user: req.auth.user
  })
})

/**
 * Make this router available
 */
module.exports = router;
