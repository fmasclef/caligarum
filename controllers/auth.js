/**
 * Authentication controller
 */

var
  router = express.Router(),
  jwt = require('jwt-simple'),
  moment = require('moment')

/**
 * Get a JWT token
 */
router.get('/token', basicAuth(), function(req, res, next) {
  if ('user' in req.auth) {
    req.auth.user.exp = moment().unix() + config.jwt.lasting
    let webtoken = jwt.encode(req.auth.user, config.jwt.secret)
    res.status(retcode.OK)
    res.json({ jwt: webtoken })
  } else {
    // API auth
    res.status(retcode.FORBIDDEN)
    return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
  }
})

/**
 * Refresh a JWT token
 *
 * A JWT authenticated user can refresh his token as long as it's still a valid
 * one (i.e.: not expired).
 */
router.put('/token', jwtAuth(), function(req, res, next) {
  req.auth.user.exp = moment().unix() + config.jwt.lasting
  let webtoken = jwt.encode(req.auth.user, config.jwt.secret)
  res.status(retcode.OK)
  res.json({ jwt: webtoken })
})

/**
 * Make this router available
 */
module.exports = router;
