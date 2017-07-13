/**
 * Chronometer middleware
 *
 * This middleware logs to winston a summary of current request. It includes
 *    - worker ID
 *    - verb
 *    - URL
 *    - HTTP staus code
 *    - duration in ms
 */

exports = module.exports = function chronometer (options) {
  let opts = {}
  return function chronometer (req, res, next) {
    let start = Date.now()
    res.on('finish', function() {
        let duration = Date.now() - start;
        if (typeof winston !== 'undefined') {
          switch (Math.floor(res.statusCode / 100)) {
            case 4:
              winston.warn('#%d %s %s %d %dms', cluster.worker.id, req.method, req.originalUrl, res.statusCode, duration)
              break
            case 5:
              winston.error('#%d %s %s %d %dms', cluster.worker.id, req.method, req.originalUrl, res.statusCode, duration)
              break
            default:
              winston.info('#%d %s %s %d %dms', cluster.worker.id, req.method, req.originalUrl, res.statusCode, duration)
              break
          }
        }
    })
    next()
  }
}
