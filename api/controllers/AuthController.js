/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var passport = require('passport')

module.exports = {
  _config: {
    pluralize: false
  },

  /**
   * Validate the authenticated state of the requester.
   *
   * @param {Object} req
   * @param {Object} res
   */
  find: function(req, res) {
    sails.log.verbose(req.user)
    res.ok(req.user)
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  provider: function(req, res) {
    passport.endpoint(req, res)
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function(req, res) {
    passport.callback(req, res, function(err, user) {
      if (err || !user) {
        sails.log.error(err)
        // Build the redirect URL as a string. We do it this way instead of
        // using `url.format()` because it will encode the `#` char making the
        // link unuseable.
        var dest =
          sails.config.app.protocol + '://' + sails.config.app.hostname +
          '/#/login?sessionDataKey=failed&authFailure=true' +
          '&authFailureMsg=unexpected.oauth2.error'

        return res.redirect(dest)
      }

      req.login(user, function(err) {
        // TODO: Could implement retry logic here
        if (err) {
          console.error(err)
          return res.serverError(err)
        }
        res.redirect('/')
      })
    })
  },

  /**
   *
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut())
   * that can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any). Additionally, call gatekeeper logout endpoint to
   * logout from my.nutanix.com
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function(req, res) {
    req.session.destroy();
    req.logout()

    var oauthLogoutRedirect =
      "https"+ '://' +
      "dev-my.nutanix.com" + '/api/v1/logout'

    //var response = { redirectTo: oauthLogoutRedirect }
    return res.redirect(oauthLogoutRedirect)
  }
}
