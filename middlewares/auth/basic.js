/**
 * HTTP Basic auth middleware
 *
 * This middleware takes care of decoding basic authentication header. It should
 * populate req.auth.key or, if relevant req.auth.user
 *
 * Note that this middleware handle both API key and email/passwd authentication
 *
 * This will return:
 *   401 if no authorisation header is sent
 *   403 if the token do not match anything in database
 */

 exports = module.exports = function basic (options) {
   let opts = {}
   return function basic (req, res, next) {
     var auth = req.get('authorization');
     if ('undefined' !== typeof auth && auth.startsWith("Basic")) {
       req.auth = {}
       let [user,passwd] = Buffer.from(auth.split(' ')[1], 'base64').toString('utf8').split(':')
       if (user.toLowerCase() === "api") {
         // API key authentication
         db.connection.query("select * from `auht_api_key` WHERE `api_key` = ?", passwd, function(err, results, fields) {
           if (results.length == 1) {
             req.auth.key = passwd
             next()
           } else {
             res.status(retcode.FORBIDDEN)
             return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
           }
         })
       } else {
         // user authentication
         db.connection.query("select * from `auth_user` WHERE `email` = ? and status_id=1", user.toLowerCase(), function(err, results, fields) {
           if (results.length == 1) {
             if (pwdmgr.check(passwd, results[0].password)) {
               req.auth.user = {
                 id: results[0].hash,
                 firstname: results[0].firstname,
                 lastname: results[0].lastname,
                 email: results[0].email,
                 type: results[0].type_id
               }
               next()
             } else {
               res.status(retcode.FORBIDDEN)
               return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
             }
           } else {
             res.status(retcode.FORBIDDEN)
             return res.json({ code: retcode.FORBIDDEN, message: retcode.text(retcode.FORBIDDEN) })
           }
         })
       }
     } else {
       res.status(retcode.UNAUTHORIZED)
       return res.json({ code: retcode.UNAUTHORIZED, message: retcode.text(retcode.UNAUTHORIZED) })
     }
   }
 }
