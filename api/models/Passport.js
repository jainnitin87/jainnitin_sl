/**
* Passport.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: ['mongodb'],
  schema: true,
  attributes: {
    protocol: {type: 'alphanumeric', required: true},
    provider: {type: 'alphanumericdashed'},
    identifier: {type: 'string' },
    tokens: {type: 'json'},

    // Associations

    // Associate every passport with one, and only one, user.
    user: {model: 'User', required: true}
  }
}

