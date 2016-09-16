var _ = require('lodash')
var Q = require('q')
var passport = require('passport')

// Load authentication protocols
passport.protocols = require('./protocols')

/**
 * Connect a third-party profile to a local user
 *
 * This is where most of the magic happens when a user is authenticating with a
 * third-party provider. What it does, is the following:
 *
 *   1. Given a provider and an identifier, find a matching Passport.
 *   2. From here, the logic branches into two paths.
 *
 *     - A user is not currently logged in:
 *       1. If a Passport wasn't found, create a new user as well as a new
 *          Passport that will be assigned to the user.
 *       2. If a Passport was found, get the user associated with the passport.
 *
 *     - A user is currently logged in:
 *       1. If a Passport wasn't found, create a new Passport and associate it
 *          with the already logged in user (ie. "Connect")
 *       2. If a Passport was found, nothing needs to happen.
 *
 * As you can see, this function handles both "authentication" and "authori-
 * zation" at the same time. This is due to the fact that we pass in
 * `passReqToCallback: true` when loading the strategies, allowing us to look
 * for an existing session in the request and taking action based on that.
 *
 * For more information on auth(entication|rization) in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 * http://passportjs.org/guide/authorize/
 *
 * @param {Object}   req
 * @param {Object}   query
 * @param {Object}   profile
 * @param {Function} next
 */
passport.connect = function(req, query, profile, next) {
  sails.log.verbose('passport: Connecting user to a passport')
  sails.log.silly('passport: connect  --> query', query)
  sails.log.silly('passport: connect  --> profile', profile)
  var user = {}
  var identifier = query.identifier.toString()
  var provider

  // Get the authentication provider from the query.
  query.provider = req.param('provider')

  // Use profile.provider or fall back to the query param if it is undefined.
  provider = profile.provider || query.provider

  // If the provider cannot be identified we cannot match it to a passport so
  // throw an error and let whoever is next in line take care of it.
  if (!provider){
    return next(new Error('No authentication provider was identified.'))
  }
  if (!_.isArray(profile.emails) || profile.emails.length === 0) {
    return next(new Error('No email available in profile'))
  }

  // Assuming the profile object contains a list of emails, try to grab the
  // primary first and add it to the user. If no email has this property then
  // just user the first one from the list.
  user.email = _.findWhere(profile.emails, {type: 'primary'})
  user.email = (user.email) ? user.email.value : profile.emails[0].value
  user.emails = profile.emails
  user.firstName = profile.name.givenName
  user.lastName = profile.name.familyName
  user.scimId = profile.id
  user.userName = profile.userName
  user.groups = _.map(profile.groups, function(item) {return item.display})
  // Get contactId and accountId
  var wso2json = profile._json || {}
  var wso2Resources = wso2json.Resources || []
  wso2Resources = (wso2Resources.length > 0) ? wso2Resources[0] : {}
  var wso2Extension = wso2Resources.wso2Extension || {}
  user.contactId = wso2Extension.contactId
  user.accountId = wso2Extension.accountId

  Q.ninvoke(User, 'native')
    .then(function(collection) {
      var query = {userName: profile.userName}
      var update = {$set: user}
      var options = {upsert: true}

      return Q.ninvoke(collection, 'findAndModify', query, undefined,
        update, options)
    })
    .spread(function(record, result) {
      // The `findAndModify` method will return different results based on
      // which operation was performed. If an existing record was updated,
      // then the entire object is returned. However, if a new record is
      // created, then only the `_id` of the new record is returned.
      sails.log.silly(record)
      sails.log.silly(result)
      var userId = (result.lastErrorObject.updatedExisting) ?
        record._id.toString() :
        result.lastErrorObject.upserted.toString()
      query.user = userId
      user.id = userId
      sails.log.silly('provider is --> '+provider)
      sails.log.silly('identifier is --> '+identifier)
      return Passport.findOne({provider: provider, identifier: identifier})
    })
    .then(function(passport) {
      return Q.promise(function(resolve, reject) {
        sails.log.silly(passport)
        var isLoggedIn = !!req.user
        var hasPassport = !!passport

        // Scenario: A new user is attempting to sign up using a third-party
        //           authentication provider.
        // Action:   Create a new user and assign them a passport.
        if (!isLoggedIn && !hasPassport) {
          sails.log.verbose('passport: Not logged in. No passport')
          Passport.create(query)
            .then(function(passport) {
              resolve(user)
            })
            .fail(reject)
        }

        // Scenario: An existing user is trying to log in using an already
        //           connected passport.
        // Action:   Get the user associated with the passport.
        if (!isLoggedIn && hasPassport) {
          sails.log.verbose('passport: Not logged in. Has passport')
          // If the tokens have changed since the last session, update them.
          if (!!query.tokens && query.tokens !== passport.tokens) {
            passport.tokens = query.tokens;
          }
          // Save any updates to the Passport and fetch the associated user.
          Q.npost(passport, 'save')
            .then(function(passport1) {
              sails.log.silly(passport1)
              return User.findOne({id: passport.user})
            })
            .then(resolve)
            .fail(reject)
        }

        // Scenario: A user is currently logged in and trying to connect a new
        //           passport.
        // Action:   Create and assign a new passport to the user.
        if (isLoggedIn && !hasPassport) {
          sails.log.verbose('passport: Logged in. No passport')
          query.user = req.user.id
          Passport.create(query)
            .then(function(passport) {
              resolve(user)
            })
            .fail(reject)
        }

        // Scenario: The user is already good to go.
        // Action:   Simply pass along the already established session.
        if (isLoggedIn && hasPassport) {
          sails.log.verbose('passport: Logged in. Has passport')
          resolve(user)
        }
      })
    })
    .then(function(user) {
      next(null, user)
    })
    .fail(next)
    .done()
}

/**
 * Load all strategies defined in the Passport configuration.
 *
 * @see config/passport.js
 */
passport.loadStrategies = function() {
  var strategies = sails.config.passport

  // NOTE: this binding does not work in new versions of lodash
  // TODO: Could add support for multiple strategies here
  _.each(_.keys(strategies), function(key) {
    var options = {passReqToCallback: true}
    var protocol = strategies[key].protocol
    var Strategy = strategies[key].strategy;

    // Merge the the strategy options
    _.extend(options, strategies[key].options)

    sails.log.verbose('passport: Initializing strategy: ' + key)
    this.use(new Strategy(options, this.protocols[protocol]))
  }, this)
}

/**
 * Create an authentication endpoint
 *
 * For more information on authentication in Passport.js,
 * @see http://passportjs.org/guide/authenticate/
 *
 * @param {Object} req
 * @param {Object} res
 */
passport.endpoint = function(req, res) {
  sails.log.verbose('passport: reached passport.endpoint')
  var strategies = sails.config.passport
  var provider = req.param('provider')
  var options = {}

  if (!strategies.hasOwnProperty(provider)) {
    return res.badRequest('Invalid auth provider')
  }

  // Attach scope if it has been set in the config
  if (strategies[provider].hasOwnProperty('scope')) {
    options.scope = strategies[provider].scope;
  }

  // Redirect the user to the provider for authentication. When complete,
  // the provider will redirect the user back to the application at
  //     /auth/:provider/callback
  sails.log.verbose('passport: Authenticating via ' + provider)
  this.authenticate(provider, options)(req, res, req.next)
}

/**
 * Create an authentication callback endpoint
 *
 * For more information on authentication in Passport.js,
 * @see http://passportjs.org/guide/authenticate/
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} callback
 */
passport.callback = function(req, res, next) {
  sails.log.verbose('passport: reached callback')
  var provider = req.param('provider')
  var action = req.param('action')

  // TODO: Handle various action scenarios
  sails.log.verbose('passport: Authenticating callback for ' + provider)
  this.authenticate(provider, next)(req, res, req.next)
}

/**
 * Serialize the user object into the session.
 *
 * @see http://passportjs.org/guide/configure
 * @see http://sailsjs.org/#/documentation/anatomy/myApp/config/session.js.html
 * @see config/session.js
 * @see api/policies/passport.js
 *
 * @param {Object} User record
 * @param {Function} callback
 */
passport.serializeUser(function(user, next) {
  sails.log.verbose('passport: serializing user')
  sails.log.silly(user)
  next(null, user.id);
})

/**
 * De-serialize the user object from the session.
 *
 * @see http://passportjs.org/guide/configure
 * @see http://sailsjs.org/#/documentation/anatomy/myApp/config/session.js.html
 * @see config/session.js
 * @see api/policies/passport.js
 *
 * @param {String} Unique identifier for the user
 * @param {Function} callback
 */
passport.deserializeUser(function(id, next) {
  sails.log.verbose('passport: de-serializing user: ' + id)
  User.findOne(id, next);
})


module.exports = passport
