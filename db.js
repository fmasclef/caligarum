/**
 * MySQL / MariaDB connector
 *
 * This connector creates a connextion pool to a MySQL compatible server. This
 * includes MariaDB.
 */


var
  mysql = require('mysql'),
  async = require('async')

var state = {
  pool: null,
  mode: null
}

exports.connect = function(done) {
  state.pool = mysql.createPool({
    host            : config.database.host,
    port            : config.database.port,
    user            : config.database.user,
    password        : config.database.password,
    database        : config.database.db,
    connectionLimit : config.database.threads,
    queueLimit      : config.database.queue
  })

  state.pool.on('acquire', function (connection) {
    winston.debug('Connection %d acquired', connection.threadId);
  })

  state.pool.on('enqueue', function () {
    winston.warn('Waiting for available connection slot');
  })

  state.pool.on('release', function (connection) {
    winston.debug('Connection %d released', connection.threadId);
  })

  done()
}

exports.connection = {
    query: function () {
        var queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {}

        state.pool.getConnection(function (err, conn) {
            if (err) {
              if (eventNameIndex.error) {
                  eventNameIndex.error();
              }
            }
            if (conn) {
              conn.beginTransaction(function(err) {
                if (err) { throw err; }

                var q = conn.query.apply(conn, queryArgs);

                q.on('error', function(err) {
                  conn.rollback(function() {
                    throw err
                  })
                })

                q.on('end', function () {
                  conn.commit(function(err) {
                  if (err) {
                    return conn.rollback(function() {
                      throw err
                    })
                  }
                  conn.release();
                  })
                })

                events.forEach(function (args) {
                    q.on.apply(q, args);
                })
              })
            }
        })

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments))
                eventNameIndex[eventName] = callback
                return this
            }
        }
    }
}

exports.drop = function(tables, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  async.each(tables, function(name, cb) {
    pool.query('DELETE * FROM ' + name, cb)
  }, done)
}
