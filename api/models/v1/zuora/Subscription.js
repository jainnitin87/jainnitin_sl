/**
 * V1/FirmwareV1.js
 *
 * @description :: V1/Firmware model
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
/*jshint node:true */
/*jshint strict:false */
module.exports = {
	connection: ['zuoraRest'],
  autoCreatedAt: false,
	autoUpdatedAt: false,
  tableName: 'subscriptions',	
  attributes: {
    accountKey: 'string',
    subscribeToRatePlans: 'array',
    contractEffectiveDate: 'string',
    serviceActivationDate: 'string',
    initialTerm: 'string',
    autoRenew: 'boolean',
    termType: 'string',
    renewalTerm: 'string'
  }
};
