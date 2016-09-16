
module.exports = {
  // Defaults
  //---------
  INTERNAL_ACCOUNT_ID: '0016000000gBW1yAAG',
  PARTNER_TYPES: ['Channel', 'Technology Alliance Partner'],
  PARTNER_UNAME_SUFFIX: '.ntnx',
  NUTANIX_CORP_DOMAIN: 'nutanix',
  DELL_PARTNER_DOMAIN: 'dell',

  // Groups
  //------------
  COMMUNITY_GROUP: 'COMMUNITY',
  INTERNAL_GROUP: 'INTERNAL',
  CUSTOMER_GROUP: 'CUSTOMER',
  PARTNER_GROUP: 'PARTNER',
  PARTNER_CUSTOMER_GROUP: 'PARTNERCUSTOMER',
  CE_GROUP: 'NOS_CE',
  PARTNER_INTERNAL_GROUP: 'PARTNER_INTERNAL',
  OEM_PARTNER_GROUP: 'OEMPARTNER',

  //OEM PARNER TO GROUP MAP
  OEM_PARTNER_GROUP_MAP: {
    dell: {
      OEM_SUPPORT_REP_GROUP: 'OEMSUPPORTREP',
      OEM_CUSTOMER_GROUP: 'OEMCUSTOMER',
      OEM_PARTNER_GROUP: 'OEMPARTNER'
    },
    lenovo: {
      OEM_SUPPORT_REP_GROUP: 'LENSUPPORTREP',
      OEM_CUSTOMER_GROUP: 'LENCUSTOMER',
      OEM_PARTNER_GROUP: 'LENPARTNER'
    }
  },

  // Claims
  //-------
  // These are the mappings from IDP claim to field name. The IDP referrs to
  // it's field names by claim url with a format of:
  //  {name: 'http://wso2.org/claims/foo', value: 'someVal'}
  // This mapping allows us to interface with these claims using a standarized
  // field name.
  //
  // @see api/models/IdentityUser.js
  // @see https://docs.wso2.com/display/IS500/Claim+Management
  //
  IDP_CLAIM_MAP: {
    email: 'http://wso2.org/claims/emailaddress',
    firstName: 'http://wso2.org/claims/givenname',
    lastName: 'http://wso2.org/claims/lastname',
    accountId: 'http://wso2.org/claims/accountId',
    contactId: 'http://wso2.org/claims/contactId',
    sfuserName: 'http://wso2.org/claims/sfuserName',
    externalId: 'http://wso2.org/claims/externalId',
    forcePasswordReset: 'http://wso2.org/claims/forcePasswordReset',
    workemail: 'http://wso2.org/claims/workemailaddress',
    phone: 'http://wso2.org/claims/telephone',
    twitterHandle: 'http://wso2.org/claims/twitterHandle',
    streetAddress: 'http://wso2.org/claims/streetaddress',
    locality: 'http://wso2.org/claims/locality',
    region: 'http://wso2.org/claims/region',
    country: 'http://wso2.org/claims/country',
    postalCode: 'http://wso2.org/claims/postalCode'
  },

  // HTTP Response codes
  //--------------------
  SERVER_ERROR: 500,
  OK: 200,
  OK_CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
}
