/**
 * caligarum
 * an ORM-free REST API with OAuth2 support
 *
 * created by François Masclef
 */

global.config   = require('./config/' + (process.env.NODE_ENV || 'production') + '.json')
global.cluster  = require('cluster')
global.db       = require('./db')
global.Helpers  = require('./services/helpers')
global.pjson    = require('./package.json')
global.redis    = require('redis').createClient(config.redis || {}),
global.retcode  = require('./enums/httpStatusCode')
global.winston  = require('winston')

global.basePath = __dirname

var
  mysql = require('mysql'),
  patcher = require('mysql-patcher'),
  path = require('path')

/**
 * Patch String class
 */
String.prototype.ucfirst = function()
{
   return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase()
}

/**
 * Configure Winston
 */
winston.configure({
   level: config.log.level || 'info',
   format: winston.format.combine(
     winston.format.splat(),
     winston.format.colorize(),
     winston.format.timestamp(),
     winston.format.align(),
     winston.format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
   ),
   transports: []
 });
if (config.log.console.enabled) winston.add(new winston.transports.Console())
if (config.log.file.enabled) winston.add(winston.transports.File,{
  filename : config.log.file.filename || '/var/log/caligarum/caligarum.log',
  maxsize  : config.log.file.size || 10485760,
  maxFiles : config.log.file.files || 10,
  zippedArchive : 'zip' in config.log.file ? config.log.file.zip : true
})

/**
 * Start server in a clustered world
 */
if (cluster.isMaster) {

  // deal with `npm stop`
  process.title = process.argv[2]

  // Hello caligarum
  let figlet = require('figlet')
  console.log(
    figlet.textSync(pjson.name, {
      font: 'Small',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
  )
  winston.info("%s %s running on port %d from %s", pjson.name, pjson.version, config.server.port, basePath)

  // Check caligarum database, patch it if required
  winston.info("checking caligarum schema, applying patch if required")
  patcher.patch({
    host       : config.database.host,
    port       : config.database.port,
    user       : config.database.user,
    database   : config.database.db,
    password   : config.database.password,
    dir        : path.join(__dirname, 'sql'),
    patchKey   : 'schema-patch-level',
    patchLevel : 1,
    filePrefix : 'caligarum',
    metaTable  : 'metadata',
    mysql      : mysql
  }, function(err, res) {
    if (err) {
      winston.error(err)
      process.exit(1)
    }
    // Check custom database, patch it if required
    winston.info("checking custom schema, applying patch if required")
    patcher.patch({
      host       : config.database.host,
      port       : config.database.port,
      user       : config.database.user,
      database   : config.database.db,
      password   : config.database.password,
      dir        : path.join(__dirname, 'sql'),
      patchKey   : (config.database.custom_sql_prefix || 'custom') + '-patch-level',
      patchLevel : 1,
      filePrefix : config.database.custom_sql_prefix || 'custom',
      metaTable  : 'metadata',
      mysql      : mysql
    }, function(err, res) {
      if (err) {
        winston.error(err)
        process.exit(1)
      }
      // Let's fork
      var cpuCount = require('os').cpus().length;
      winston.info('spawning %d workers', cpuCount)
      for (let i=0; i<cpuCount; i+=1) {
        cluster.fork()
      }
      // handle dying workers
      cluster.on('exit', function(worker) {
        winston.warn('worker %d died, respawning', worker.id)
        cluster.fork()
      })
    })
  })

} else {
  db.connect(function(err) {
    if (err) {
      winston.error(err)
      process.exit(2)
    } else {
      let app = require('./app')
      app.set('port', config.server.port)
      let server = app.listen(app.get('port'), function() { })
    }
  })
}
