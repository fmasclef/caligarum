/**
 * Simple Parameter Checker middleware
 *
 * This middleware checks that a list of parameters exists in req. It takes a
 * parameter or an array of parameters as its param.
 */

exports = module.exports = function check (requiredParams) {
  if (!Array.isArray(requiredParams))
    requiredParams = [ requiredParams ]
  return function check (req, res, next) {
    for (let p of requiredParams) {
      if (!(p in req.body)) {
        res.status(retcode.BAD_REQUEST)
        return res.json({ code: retcode.BAD_REQUEST, message: retcode.text(retcode.BAD_REQUEST), missing: p })
      }
    }
    next()
  }
}
