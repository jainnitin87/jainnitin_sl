var express = require('express');
var port = process.env.PORT || 8080;
var request = require('request');

var app = express();

app.get('/test123', function(req, res) {
    console.log("hit the end point");
    //getZuoraSignature();
    res.sendfile('static/static.html', {
        root: __dirname
    });
});

app.get('/api/v1/createSubscription/:paymentMethodId', function(req, res) {
    console.log('creating new subscription for provided paymentMethodId = ' + req.params.paymentMethodId);

    var data = {
        "name": "Test Account- Nitin",
        "currency": "USD",
        "billCycleDay": 0,
        "autoPay": false,
        "billToContact": {
            "country": "United States",
            "firstName": "John",
            "lastName": "Smith",
            "state": "CA"
        },
        "hpmCreditCardPaymentMethodId": req.params.paymentMethodId,
        "subscription": {
            "termType": "TERMED",
            "initialTerm": 12,
            "renewalTerm": 12,
            "autoRenew": true,
            "notes": "This is a trial subscription for POST account demo.",
            "subscribeToRatePlans": [{
                    "productRatePlanId": "2c92c0f8564ed83a01566b2ed4f971d9"

                }

            ],
            "contractEffectiveDate": "2016-01-01"
        }
    };

    var formData = JSON.stringify(data);

    request({
        headers: {
            'Content-Type': 'application/json'
        },
        uri: 'https://apisandbox-api.zuora.com/rest/v1/accounts',
        body: formData,
        method: 'POST'
    }, function(err, res1, body) {

        if (err) {  
            console.log(body);
            return console.error('failed to create Subscription', err); 
        } 
        else {
            console.log(res1,body);
            res.sendfile('static/successSubscription.html', {
                root: __dirname
            });
        }

    }).auth('nitin.jain@nutanix.com', 'Nutanix1');

})


app.get('/api/v1/getZuoraSignature', function(req, res) {
    console.log("requesting signature");
    var data = {
        "uri": "https://www.zuora.com/apps/PublicHostedPageLite.do",
        "method": "POST",
        "pageId": "2c92c0f85721ff7c015731d73546108c"
    };

    var formData = JSON.stringify(data);

    request({
        headers: {
            'Content-Type': 'application/json'
        },
        uri: 'https://apisandbox-api.zuora.com/rest/v1/rsa-signatures',
        body: formData,
        method: 'POST'
    }, function(err, res1, body) {
        if (err) {  
            return console.error('failed to get the signature', err); 
        } 
        console.log('Got the signature', body);
        res.send(body);
    }).auth('nitin.jain@nutanix.com', 'Nutanix1');
});

app.get('/api/v1/subscriptionCallout', function(req,res){
    console.log("callout for successful subscription");
    console.log(req);
    console.log(req.params);
})


app.listen(port);
