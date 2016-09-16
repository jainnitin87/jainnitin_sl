//
// Authentication Protocols
//
// Protocols where introduced to patch all the little inconsistencies between
// the different authentication APIs. While the local authentication strategy
// is as straigt-forward as it gets, there are some differences between the
// services that expose an API for authentication.
//

module.exports = {
  oauth2 : require('./oauth2')
}
