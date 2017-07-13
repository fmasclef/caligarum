global.express   = require('express')
global.app       = express()
global.i18n      = require('i18n')
global.basicAuth = require('./middlewares/auth/basic')
global.jwtAuth   = require('./middlewares/auth/jwt')
global.chkparams = require('./middlewares/request/simpleparamchecker')
global.mailer    = require('./services/mailer')
global.pwdmgr    = require('./services/password-manager')

var
  bodyparser = require('body-parser'),
  helmet = require('helmet'),
  compression = require('compression'),
  chronometer = require('./middlewares/request/chronometer')

// security settings
app.set('trust proxy', 1)
app.use(helmet())
app.use(compression())

// middlewares
app.use(chronometer());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

// i18n intended for mailing purpose
i18n.configure({
    directory: __dirname + '/locales',
    updateFiles: false,
    objectNotation: true
})
app.use(i18n.init)
app.use(function(req, res, next) {
    app.locals.__ = res.locals.__ = res.__ = function() {
        return i18n.__.apply(req, arguments)
    }
    next()
})

// templating engine, in case we need to send some mails
app.set('view engine', 'pug')

app.use(express.static(__dirname + '/static'))

// controllers
app.use('/'            , require('./controllers/base'))
app.use('/auth'        , require('./controllers/auth'))
app.use('/user'        , require('./controllers/user'))

// test controllers, you can safely remove this
if (process.env.NODE_ENV != 'production') {
  app.use('/testing/basic' , require('./controllers/testing/authBasic'))
  app.use('/testing/jwt'   , require('./controllers/testing/authJWT'))
}

// 404
app.use(function(req, res, next) {
  res.status(retcode.NOT_FOUND)
  return res.json({ code: retcode.NOT_FOUND, message: retcode.text(retcode.NOT_FOUND) })
})

// Errors
app.use(function(error, req, res, next) {
  let code = ('code' in error) ? error.code: retcode.INTERNAL_SERVER_ERROR
  res.status(code)
  return res.json({ code: code, message: (process.env.NODE_ENV == 'production') ? retcode.text(code) : error })
})

module.exports = app
