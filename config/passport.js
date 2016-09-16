//
// Passport configuration
//

module.exports.passport = {
  wso2: {
    protocol: 'oauth2',
    scope: 'openid',
    strategy: require('passport-wso2').Strategy,
    options: {
      authorizationURL: process.env.IDP_AUTH_URL,
      tokenURL: process.env.IDP_TOKEN_URL,
      userProfileURL: process.env.IDP_USER_PROFILE_URL,
      clientID: process.env.IDP_CLIENT_ID,
      clientSecret: process.env.IDP_CLIENT_SECRET,
      callbackURL: process.env.IDP_CALLBACK_URL,
    }
  }
}
