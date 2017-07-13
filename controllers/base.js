/**
 * Base controller
 */

var
  router = express.Router(),
  fs = require('fs')

/**
 * Default route.
 */
router.get('/', function(req, res, next) {
  res.status(retcode.OK)
  res.json({
    banner: pjson.name + " " + pjson.version + " " + pjson.description,
    doc: "curl -X OPTIONS " + config.server.url
  })
})

router.options('/', function(req, res, next) {
  res.status(retcode.OK)
  res.send(fs.readFileSync('./static/api.md'))
})

/**
 * Make this router available
 */
module.exports = router;
