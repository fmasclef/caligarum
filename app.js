global.express   = require('express')
global.app       = express()
global.i18next   = require('i18next')
global.i18n      = require('i18next-express-middleware')
global.fsbackend = require('i18next-node-fs-backend')
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

// templating engine, in case we need to send some mails
app.set('view engine', 'pug')

// security settings
app.set('trust proxy', 1)
app.use(helmet())
app.use(compression())

// middlewares
app.use(chronometer());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

// i18n intended for mailing purpose
i18next
  .use(fsbackend)
  .use(i18n.LanguageDetector)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    preload: ['en', 'fr'],
    saveMissing: false,
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    }
  })

// make use of i18next express middleware
app.use(i18n.handle(i18next, {
  removeLngFromUrl: false
}))

// we'll use pug a static way, so we can't rely on i18next express middleware
app.use(function(req, res, next) {
    app.locals.t = function() {
        return req.t.apply(req, arguments)
    }
    next()
})

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
