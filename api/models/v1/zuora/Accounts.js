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
  attributes: {
    creditCard: 'json',
    invoiceTargetDate: 'string',
    name: 'string',
    billCycleDay: 'string',
    soldToContact: 'json',
    billToContact: 'json',
    invoiceCollect: 'boolean',
    notes: 'string',
    subscription: 'json',
    paymentTerm: 'string',
    currency: 'string'
  }
};
