/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var passport = require('passport')
var Q = require('q')
var https = require('https')

module.exports.bootstrap = function(cb) {
    // Ignore SSL errors when not in production.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED =
    (process.env.NODE_ENV === 'development') ? '0' : '1'

    sails.services.passport.loadStrategies()

  // Inject SSL root CAs
  require('ssl-root-cas/latest')
   .inject()
  // TODO: Add a function to ssl-root-cas that allows for injecting a string
  // value. Currently, it only supports using a file path so we need to
  // manualy inject our cert since we store it as a string within the
  // environment
  https.globalAgent.options.ca.push(sails.config.idp.sslCert)

  
    cb()

/*  initializePassport()
    .then(function() {
      return Q.promise(function(resolve, reject) {
        sails.services.passport.loadStrategies()
        resolve()
      })
    })
    .then(cb)
    .fail(sails.log.error)*/
  // Initialize passport services
  //sails.services.passport.loadStrategies()

  //passport.initialize()

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //cb();


    sails.on('lifted', function() {
        console.log('Lifted sails now creating SOAP Object');
        Utils.createSOAPClient();
    });



///////////////////////////////////////////////////////////////////////////////
// Private
function initializePassport() {
  sails.log.verbose('Bootstrap: Initializing passport')

  return Q.promise(function(resolve, reject, progress) {
    _.extend(sails.config.http, {
      customMiddleware: function(app) {app.use(passport.initialize())}
    })

    resolve()
  })
}
};
