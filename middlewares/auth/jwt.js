/**
 * Bearer authentication for users
 *
 * Authenticates a user using its token. The token should be passed as the auth
 * bearer header. We can call this an OAuth2 protocol hack :)
 */

var
  jwt = require('jwt-simple'),
  moment = require('moment');

  exports = module.exports = function basic (options) {
    let opts = {}
    return function basic (req, res, next) {
      if ('authorization' in req.headers) {
      winston.debug('[jwt] ' + req.headers.authorization)
      if (req.headers.authorization.startsWith('Bearer ')) {
        var token = req.headers.authorization.split(' ')[1]
        if (token && '' !== token) {
          try {
            // This will throw an exception if the token signature does not match
            var
              ts = moment().unix(),
              payload = jwt.decode(token, config.jwt.secret, false, 'HS256')

            winston.debug('[jwt] user %s', payload.id)

            if (payload.exp >= ts) {
              req.token = token
              req.auth = { user: payload}
              return next()
            } else {
              // Expired token
              winston.warn('[jwt] web token is expired')
              res.status(retcode.FORBIDDEN)
              return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
            }
          } catch (err) {
            // Invalid web token
            winston.warn('[jwt] Invalid JWT signature');
            res.status(retcode.FORBIDDEN)
            return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
          }
        } else {
          winston.warn('[jwt] empty token');
          res.status(retcode.FORBIDDEN)
          return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
        }
      } else {
        winston.warn('[jwt] not a bearer authentication mechanism');
        res.status(retcode.FORBIDDEN)
        return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
      }
    } else {
      winston.warn('[jwt] no authorization header provided');
      res.status(retcode.UNAUTHORIZED)
      return res.json({ code: retcode.UNAUTHORIZED, message: retcode.text(retcode.UNAUTHORIZED) })
    }
  }

}
