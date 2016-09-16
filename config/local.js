module.exports = {
  app: {
    hostname: 'local-dev.nutanix.com',
    protocol: 'https',
  },

  connections: {
    pgSqlServer: {
      adapter: 'sails-postgresql',
      url: 'postgres://u5hu90vmsdpiii:pasajqaftv96045249iahjehpfl@ec2-54-204-47-38.compute-1.amazonaws.com:5872/d8flqqgs1o4cu9',
      ssl: true,
      multipleStatements: true
   },
    mongodb: {
      url: 'mongodb://localhost:27017/billingTest'
    },
  },

  session: {
    adapter: 'connect-mongo',
    collection: 'sessions',
    url: 'mongodb://localhost:27017/billingTest'
  },

  passport: {
    wso2: {
      protocol: 'oauth2',
      scope: 'openid',
      strategy: require('passport-wso2').Strategy,
      options: {
        authorizationURL: 'https://login-dev.nutanix.com:9443/oauth2/authorize',
        tokenURL: 'https://login-dev.nutanix.com:9443/oauth2/token',
        userProfileURL: 'https://login-dev.nutanix.com:9443/wso2/scim/Users/me',
        clientID: 'xFAanE17CL64VYytFFzaFnsWgSsa',
        clientSecret: 'Rl7n9QN72sRyyMIXpVTg51Ym0I4a',
        callbackURL: 'http://localhost:1337/api/v1/auth/wso2/callback',
      }
    }
  },

  // DEV
  idp: {
    commonauthUrl: 'https://login-dev.nutanix.com:9443/commonauth',
    defaultGroupId: '179148a6-d1a9-4bda-b81d-ac53d72a70f6',
    defaultGroupName: 'COMMUNITY',
    sslCert:
      '-----BEGIN CERTIFICATE-----\n' +
      'MIIElDCCA3ygAwIBAgIQAf2j627KdciIQ4tyS8+8kTANBgkqhkiG9w0BAQsFADBh\n' +
      'MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\n' +
      'd3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD\n' +
      'QTAeFw0xMzAzMDgxMjAwMDBaFw0yMzAzMDgxMjAwMDBaME0xCzAJBgNVBAYTAlVT\n' +
      'MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxJzAlBgNVBAMTHkRpZ2lDZXJ0IFNIQTIg\n' +
      'U2VjdXJlIFNlcnZlciBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\n' +
      'ANyuWJBNwcQwFZA1W248ghX1LFy949v/cUP6ZCWA1O4Yok3wZtAKc24RmDYXZK83\n' +
      'nf36QYSvx6+M/hpzTc8zl5CilodTgyu5pnVILR1WN3vaMTIa16yrBvSqXUu3R0bd\n' +
      'KpPDkC55gIDvEwRqFDu1m5K+wgdlTvza/P96rtxcflUxDOg5B6TXvi/TC2rSsd9f\n' +
      '/ld0Uzs1gN2ujkSYs58O09rg1/RrKatEp0tYhG2SS4HD2nOLEpdIkARFdRrdNzGX\n' +
      'kujNVA075ME/OV4uuPNcfhCOhkEAjUVmR7ChZc6gqikJTvOX6+guqw9ypzAO+sf0\n' +
      '/RR3w6RbKFfCs/mC/bdFWJsCAwEAAaOCAVowggFWMBIGA1UdEwEB/wQIMAYBAf8C\n' +
      'AQAwDgYDVR0PAQH/BAQDAgGGMDQGCCsGAQUFBwEBBCgwJjAkBggrBgEFBQcwAYYY\n' +
      'aHR0cDovL29jc3AuZGlnaWNlcnQuY29tMHsGA1UdHwR0MHIwN6A1oDOGMWh0dHA6\n' +
      'Ly9jcmwzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEdsb2JhbFJvb3RDQS5jcmwwN6A1\n' +
      'oDOGMWh0dHA6Ly9jcmw0LmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEdsb2JhbFJvb3RD\n' +
      'QS5jcmwwPQYDVR0gBDYwNDAyBgRVHSAAMCowKAYIKwYBBQUHAgEWHGh0dHBzOi8v\n' +
      'd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwHQYDVR0OBBYEFA+AYRyCMWHVLyjnjUY4tCzh\n' +
      'xtniMB8GA1UdIwQYMBaAFAPeUDVW0Uy7ZvCj4hsbw5eyPdFVMA0GCSqGSIb3DQEB\n' +
      'CwUAA4IBAQAjPt9L0jFCpbZ+QlwaRMxp0Wi0XUvgBCFsS+JtzLHgl4+mUwnNqipl\n' +
      '5TlPHoOlblyYoiQm5vuh7ZPHLgLGTUq/sELfeNqzqPlt/yGFUzZgTHbO7Djc1lGA\n' +
      '8MXW5dRNJ2Srm8c+cftIl7gzbckTB+6WohsYFfZcTEDts8Ls/3HB40f/1LkAtDdC\n' +
      '2iDJ6m6K7hQGrn2iWZiIqBtvLfTyyRRfJs8sjX7tN8Cp1Tm5gr8ZDOo0rwAhaPit\n' +
      'c+LJMto4JQtV05od8GiG7S5BNO98pVAdvzr508EIDObtHopYJeS4d60tbvVS3bR0\n' +
      'j6tJLp07kzQoH3jOlOrHvdPJbRzeXDLz\n' +
      '-----END CERTIFICATE-----\n'
  }

};
