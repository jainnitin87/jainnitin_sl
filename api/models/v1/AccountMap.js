/**
* v1/AccountMap.js
*
* @description :: Account Subscription map model
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {
  connection: 'pgSqlServer',
  tableName: 'xi_accounts_map',
  autoPK: false,
  attributes: {
    accountId: {type: 'string', columnName: 'accountid'},
    accountNumber: {type: 'string', columnName: 'accountnumber'},
    crmId: {type: 'string', columnName: 'crmid'},
    paymentMethodId: {type: 'string', columnName: 'paymentmethodid'},
    subscriptionId: {type: 'string', columnName: 'subscriptionid'},
    subscriptionNumber: {type: 'string', columnName: 'subscriptionnumber'}
  }
};
