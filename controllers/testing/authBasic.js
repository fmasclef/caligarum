/**
 * Basic authentication test controller
 */

var
  router = express.Router(),
  path   = require('path')

router.use(basicAuth())

/**
 * Test route.
 */
router.get('/', function(req, res, next) {
  if ('key' in req.auth) {
    res.json({
      api_key: req.auth.key,
    })
  } else {
    res.json({
      user: req.auth.user
    })
  }
})

/**
 * Make this router available
 */
module.exports = router;
