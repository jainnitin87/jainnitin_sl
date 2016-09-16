/**
 * V1/FirmwareV1.js
 *
 * @description :: V1/Firmware model
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
/*jshint node:true */
/*jshint strict:false */
module.exports = {
  attributes: {
    cardType: 'string',
    expirationMonth: 'integer',
    securityCode: 'string',
    cardNumber: 'string',
    expirationYear: 'integer'
  }
};
