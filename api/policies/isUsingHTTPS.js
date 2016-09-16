//
// Copyright (c) 2014 Nutanix Inc. All rights reserved.
//

var url = require('url')

module.exports = function(req, res, next) {
  sails.log.verbose('Ensuring request is using HTTPS')

  // Only enforce HTTPS when running in production mode.
  if (sails.config.environment !== 'production') {return next()}

  // If the request protocol is HTTPS then continue to process the route. We
  // need to check for either the `x-forwarded-proto` header or the request
  // protocol in order to support running the app in production mode locally.
  var protocol =
    req.headers['x-forwarded-proto'] || // <-- Heroku HTTPS
    req.protocol                        // <-- Standard HTTPS
  if (protocol === 'https') {return next()}

  // Otherwise, redirect the original request to use HTTPS.
  sails.log.verbose('Redirecting original request to HTTPS')
  var dest = url.parse(req.originalUrl)
  dest.protocol = 'https'
  dest.host = req.get('host')

  res.redirect(dest.format())
}
