
/**
 * Check if the requestor has a valid session.
 */

var ApiConstants = require('../services/ApiConstants')


function AuthenticationError(msg) {
  this.statusCode = ApiConstants.UNAUTHORIZED
  this.name = 'AuthenticationError'
  this.message = msg || ''
}
AuthenticationError.prototype = Error.prototype

module.exports = function(req, res, next) {
  sails.log.verbose('Checking authentication status')

  if (!req.isAuthenticated()) {
    var err = new AuthenticationError('Authenication required')
    res.status(err.statusCode).json(err)
    return
  }

  next()
}
