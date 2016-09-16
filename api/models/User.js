/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: ['mongodb'],
  schema: true,
  attributes: {
    firstName: 'string',
    lastName: 'string',
    email: {type: 'email', unique: true},
    emails: 'json',
    userName: 'string',
    scimId: 'string',
    groups: 'array',

    // Associations
    passports: {collection: 'Passport', via: 'user'}
  }
}
