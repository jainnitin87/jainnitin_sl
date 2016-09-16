/**
  * Copyright (c) 2014 Nutanix Inc. All rights reserved.
  * `AccountController.create()`
  * Create a new zuora account
  */
/*jshint node:true */
/*jshint strict:false */
/* global Accounts, AccountMap */
var moment = require('moment');
module.exports = {
  _config: {
    model: 'Accounts'
  },
  getCreditCardObj: function (data) {
    var ccDetails = {}, creditCard = data || {};

    ccDetails.cardType = creditCard.cardType || 'Visa';
    ccDetails.cardNumber = creditCard.cardNumber || '4111111111111111';
    ccDetails.securityCode = creditCard.securityCode || '111';
    ccDetails.expirationMonth = creditCard.expirationMonth || 1;
    ccDetails.expirationYear = creditCard.expirationYear || 2019;

    return ccDetails;
  },
  getAddress: function (contact, data) {
    contact.address1 = data.address1 || 'address1 not provided';
    contact.address2 = data.address2 || 'address2 not provided';
    contact.state = data.state || 'California';
    contact.city = data.city || 'San Jose';
    contact.country = data.country || 'USA';

    return contact;
  },
  getContactObj: function (data) {
    var contact = {}, obj = data || {};

    contact.lastName = obj.lastName || 'Lastname not provided';
    contact.firstName = obj.firstName || 'First name not provided';
    contact.workEmail = obj.workEmail || 'no-email@nutanix.com';
    contact.mobilePhone = obj.mobilePhone || '10000000000001';

    return this.getAddress(contact, obj);
  },
  getSubsTermAndRenewal: function (subscription, obj) {

    subscription.initialTerm = obj.initialTerm || '12';
    subscription.autoRenew = obj.autoRenew || true;
    subscription.termType = obj.termType || 'TERMED';
    subscription.renewalTerm = obj.renewalTerm || '12';

    return subscription;
  },
  getSubscription: function (data) {
    var subscription = {}, obj = data || {}, currentDate;
    currentDate = moment().format('YYYY-MM-DD');

    subscription = {
      subscribeToRatePlans: [{productRatePlanId: obj.productRatePlanId}],
      contractEffectiveDate: obj.contractEffectiveDate || currentDate,
      serviceActivationDate: obj.serviceActivationDate || currentDate
    };
    subscription = this.getSubsTermAndRenewal(subscription, obj);

    return subscription;
  },
  addBasicAccountsData: function (accountsObj, data) {
    var firstDateOfMonth;
    firstDateOfMonth = moment().format('YYYY-MM') + '-01';

    accountsObj.billCycleDay = data && data.billCycleDay || '1';
    accountsObj.invoiceTargetDate = data && data.invoiceTargetDate ||
     firstDateOfMonth;
    accountsObj.name = data && data.name;
    accountsObj.invoiceCollect = data && data.invoiceCollect || false;
    accountsObj.notes = data && data.notes || '';
    accountsObj.paymentTerm = data && data.paymentTerm || 'Net 30';
    accountsObj.currency = data && data.currency || 'USD';
    accountsObj.crmId = data && data.crmId;

    return accountsObj;
  },
  validateBillingContact: function (data, errors) {
    if (data.billToContact) {
      if (!data.billToContact.firstName) {
        errors.push('billToContact, firstName name is mandatory.');
      }
      if (!data.billToContact.lastName) {
        errors.push('billToContact, firstName name is mandatory.');
      }
    } else {
      errors.push('billToContact is mandatory.');
    }

    if (!data.paymentTerm) {
      errors.push('paymentTerm is mandatory.');
    }

    if (!data.currency) {
      errors.push('Currency is mandatory.');
    }

  },
  validateAccount: function (data, errors) {
    if (!Array.isArray(errors)) {
      errors = [];
    }
    // validate account data
    if (!data.name) {
      errors.push('Account name is mandatory.');
    }

    if (!data.currency) {
      errors.push('Currency is mandatory.');
    }

    this.validateBillingContact(data, errors);

    if (!data.crmId) {
      errors.push('Salesforce account id (crmId) is mandatory.');
    }

    if (errors.length > 0) {
      return false;
    } else {
      return true;
    }
  },
  saveAccountSubsMap: function (respData, requestData) {
    var map = {
      accountId: respData.accountId,
      accountNumber: respData.accountNumber,
      crmId: requestData.crmId,
      paymentMethodId: respData.paymentMethodId,
      subscriptionId: respData.subscriptionId,
      subscriptionNumber: respData.subscriptionNumber
    };

    AccountMap.create(map).exec(function (err, resp) {
      if (err) {
        console.log('errors >>> ', err);
      } else {
        console.log('success >>> ', resp);
      }
    });

  },
  create: function (req, res) {
    var data = req.body, accountObj, errors = [];

    if (this.validateAccount(data, errors) === false) {
      res.json({
        'success': false,
        'error': 'validation failed',
        'message': errors
      });
      return;
    }

    accountObj = {
      creditCard: this.getCreditCardObj(data && data.creditCard),
      soldToContact: this.getContactObj(data && data.soldToContact),
      billToContact: this.getContactObj(data && data.billToContact),
      subscription: this.getSubscription(data && data.subscription),
    };
    accountObj = this.addBasicAccountsData(accountObj, data);

    Accounts.create(accountObj).exec(function (err, user) {
      if (err) {
        return res.json( {
            err: err
          }, 500);
      } else {
        this.saveAccountSubsMap(user, data);
        res.json(user);
      }
    }.bind(this));
  },
  find: function (req, res) {
    var query = {};
    if(req.param("crmid")){
      query.crmId = req.param("crmid");
    }
    if(req.param("accountId")){
      query.accountId = req.param("accountId");
    }

    if (!query.crmId && !query.accountId) {
      res.ok({
        success: false,
        error: 'Please provide crmid'
      });
      return;
    }
    AccountMap.find(query)
      .then(function (resp) {
        res.ok(resp);
      })
      .fail(res.serverError)
      .done();
  }
};
