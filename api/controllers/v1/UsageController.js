/**
 * SubscriptionController
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    _config: {
        model: 'Usage'
    },
    postUsage: function(req, res) {

        var accId = req.param("accountId");
        var subId = req.param("subscriptionId");
        var currentDate = (new Date());
        currentDate = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + (1900 + currentDate.getYear());
        var usage = req.param("usage");
        var usageDate = req.param("usageDate") || currentDate;

        var csvWriter = require('csv-write-stream');
        var fileName = '/tmp/' + (new Date()).getTime() + '.csv';
        var fs = require('fs');
        var writer = csvWriter();
        writer.pipe(fs.createWriteStream(fileName, {
        }));

        
        

        for (var i = 0; i < usage.length; i++) {
            writer.write({
                ACCOUNT_ID: accId,
                UOM: usage[i].uom,
                QTY: usage[i].qty,
                STARTDATE: usageDate,
                ENDDATE: usageDate,
                SUBSCRIPTION_ID: subId,
                CHARGE_ID: "",
                DESCRIPTION: ""

            });
        }

        writer.end();


        console.log("posting subscriptions");
        setTimeout(function() {
            var fs = require('fs');
            var request = require('request');
            //console.log("uploading file for usage = " + fileName);
            var formData = {
                file: fs.createReadStream(fileName, {

                })
            };

            console.log("formData "+formData);
            request.post({
                url: 'https://apisandbox-api.zuora.com/rest/v1/usage',
                formData: formData,
            }, function optionalCallback(err, httpResponse, body) { 
                if (err) {  
                    return console.error('upload failed:', err); 
                } 
                console.log('Upload successful!  Server responded with:', body);
                res.json(body);
            }).auth('nitin.jain@nutanix.com', 'Nutanix1');
        }, 2000);


    }
};