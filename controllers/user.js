/**
 * User controller
 */

var
  router = express.Router(),
  crypto = require('crypto')

/**
 * Create a user
 */
router.post('/', chkparams(['email', 'firstname', 'lastname']), function(req, res, next) {
  // generate fields
  let md5               = crypto.createHash('md5').update(req.body.email.toLowerCase()).digest("hex");
  let password          = pwdmgr.generate()
  let hashed_password   = pwdmgr.hash(password)
  let recovery          = pwdmgr.generate({length: 32, symbols: false})
  // try to create user
  db.connection.query("insert into `auth_user`(`hash`,`email`,`firstname`,`lastname`,`password`,`recovery`) values(?, ?, ?, ?, ?, ?)",
    [
      md5,
      req.body.email.toLowerCase(),
      req.body.firstname.ucfirst(),
      req.body.lastname.toUpperCase(),
      hashed_password,
      recovery
    ],
    function(err, results) {
      if (err) {
        res.status(retcode.UNPROCESSABLE)
        return res.json({ code: retcode.UNPROCESSABLE, message: retcode.text(retcode.UNPROCESSABLE), reason: "duplicate" })
      } else {
        // send password by mail
        let
          mailopts = {
            to: req.body.email.toLowerCase(),
            subject: req.t('mail.title.registration', { firstname: req.body.firstname.ucfirst()})
          },
          mail = mailer.prepare('registration', {
            firstname: req.body.firstname.ucfirst(),
            password: password
          }, mailopts)
        mailer.send(mail)
        // now return
        return res.json({user: md5, passwd: password})
      }
    }
  )
})

/**
 * Fetch a user definition
 * A user will be authorized to fetch another user definition based on his type.
 * Therefore, a JSON Web Token must be passed to authorize or not the qquery.
 * Should the user not be an 'Administrator', he will fetch his own profile
 * whatever the :hash parameter is.
 */
router.get('/:hash', jwtAuth(), function(req, res, next) {
  db.connection.query("select u.*, t.* from `auth_user` u, `auth_user_type` t where t.`id`=u.`type_id` and u.`status_id`=1 and u.`hash`=?", [req.auth.user.type == 0 ? req.params.hash : req.auth.user.id], function(err, results) {
    if (err) {
      res.status(retcode.INTERNAL_SERVER_ERROR)
      return res.json({ code: retcode.INTERNAL_SERVER_ERROR, message: retcode.text(retcode.INTERNAL_SERVER_ERROR), err: err })
    }
    if (results.length == 0) {
      res.status(retcode.NO_CONTENT)
      return res.send()
    } else {
      return res.json({
        id: results[0].hash,
        firstname: results[0].firstname,
        lastname: results[0].lastname,
        email: results[0].email,
        type: results[0].type
      })
    }
  })
})

/**
 * In case of lost password... ask for a new one
 *
 * This is the kind of route that can be considered as a user or authentication
 * related one. It's intented for users to ask for a new password. It's gonna
 * make a new recevery key and send it by email.
 */
router.post('/recovery', chkparams(['email']), function(req, res, next) {
  // create a recovery key
  let recovery = pwdmgr.generate({length: 32, symbols: false})
  db.connection.query("update `auth_user` u set `recovery`=? where `email`=?", [recovery, req.body.email.toLowerCase()], function(err, result) {
    if (err) {
      res.status(retcode.INTERNAL_SERVER_ERROR)
      return res.json({ code: retcode.INTERNAL_SERVER_ERROR, message: retcode.text(retcode.INTERNAL_SERVER_ERROR), err: err })
    }
    if (result.changedRows == 1) {
      // fetch user, then send mail
      db.connection.query("select u.* from `auth_user` u where `email`=?", [req.body.email.toLowerCase()], function(err, result) {
        winston.debug('user %s has a new recovery %s', result[0].hash, result[0].recovery)
        let
          mailopts = {
            to: result[0].email,
            subject: req.t('mail.title.lostpassword')
          },
            mail = mailer.prepare('lostpassword', {
            firstname: result[0].firstname,
            hash: result[0].hash,
            recovery: result[0].recovery
          }, mailopts)
        mailer.send(mail)
      })
    }
    // 204, whatever
    res.status(retcode.NO_CONTENT)
    return res.send()
  })
})

/**
 * In case of lost password... step 2
 *
 * We'll check user's hash and recovery, then generate a new password, store and
 * send it.
 */
router.get('/recovery/:hash/:recovery', function(req, res, next) {
  db.connection.query("select u.* from `auth_user` u where `hash`=? and `recovery`=?", [req.params.hash, req.params.recovery], function(err, result) {
    if (err) {
      res.status(retcode.UNPROCESSABLE)
      return res.json({ code: retcode.UNPROCESSABLE, message: retcode.text(retcode.UNPROCESSABLE) })
    } else {
      if (result.length != 1) {
        res.status(retcode.NO_CONTENT)
        return res.send()
      } else {
        let recovery          = pwdmgr.generate({length: 32, symbols: false})
        let password          = pwdmgr.generate()
        let hashed_password   = pwdmgr.hash(password)
        db.connection.query("update `auth_user` u set u.`recovery`=?, u.`password`=? where u.`hash`=?", [recovery, hashed_password, result[0].hash], function(err, updresult) {
          if (err) {
            res.status(retcode.INTERNAL_SERVER_ERROR)
            return res.json({ code: retcode.INTERNAL_SERVER_ERROR, message: retcode.text(retcode.INTERNAL_SERVER_ERROR), err: err })
          }
          if (updresult.changedRows != 1) {
            res.status(retcode.INTERNAL_SERVER_ERROR)
            return res.json({ code: retcode.INTERNAL_SERVER_ERROR, message: retcode.text(retcode.INTERNAL_SERVER_ERROR) })
          } else {
            // send password by mail
            let
              mailopts = {
                to: result[0].email,
                subject: req.t('mail.title.recovery')
              },
                mail = mailer.prepare('recovery', {
                firstname: result[0].firstname,
                password: password
              }, mailopts)
            mailer.send(mail)
            return res.json({user: result[0].hash, password: password})
          }
        })
      }
    }
  })
})

/**
 * Make this router available
 */
module.exports = router;
