/*jshint node:true */
/*jshint strict:false */
/* global sails, Exceptions */

// moment = require('moment'),
var soap = require('soap'),
    path = require('path'),
    soapClient, zuoraSoapConfig;

module.exports = {
    zuoraConfig: null,
    createSOAPClient: function(wsdlPath, options, cb) {
        console.log('createSOAPClient');
        var zuoraConfig = sails.config.zuora,
            wsdl = path.resolve(wsdlPath || zuoraConfig.wsdl79);

        if (!options) {
            options = {};
            options.enpoint = zuoraConfig.enpoint;
        }

        soap.createClient(wsdl, options, function(err, client) {

            client.login({
                username: zuoraConfig.username,
                password: zuoraConfig.password
            }, function(err, result) {
                zuoraSoapConfig = sails.config.zuora;
                if (!err) {
                    result = result && result.result;
                    zuoraSoapConfig.Custom.session = result && result.Session;
                    zuoraSoapConfig.Custom.sessionLastUpdated = Date.now();


                    var sheader = {
                        SessionHeader: {
                            session: zuoraSoapConfig.Custom.session
                        }
                    };
                    client.addSoapHeader(sheader, "", "", "");
                }

            })

            if (cb) {
                cb(err, client);
            } else {
                if (err) {
                    Exceptions.handle(err);
                } else {
                    soapClient = client;
                }
            }
        });

        setTimeout(this.createSOAPClient, 18000000);
    },

    soap: function(method, payload, cb) {
        if (!soapClient) {

            this.createSOAPClient();
        }

        soapClient[method](payload, function(err, result, body) {
            if (err) {
                Exceptions.handle(err);
            }
            cb(err, result, body);
        });
    }
};