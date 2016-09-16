var express = require('express');
var port = process.env.PORT || 8080;

console.log("added express")
    var app = express();
    console.log("got express")

    app.get('/', function(req, res){
    	console.log("hit the end point")
        //res.send('use /static.html to see compatiablity matrix');
        var currentDate = (new Date());

        var currentDate = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + (1900 + currentDate.getYear());
        var usageDate = currentDate;

        var csvWriter = require('csv-write-stream');
        var fileName = 'public/' + (new Date()).getTime() + '.csv';
        var fs = require('fs');
        var writer = csvWriter();
        	writer.pipe(fs.createWriteStream(fileName, {

        }));

        
        

        for (var i = 0; i < 1; i++) {
            writer.write({
                ACCOUNT_ID: "A00000266",
                UOM: "GB",
                QTY: "100",
                STARTDATE: usageDate,
                ENDDATE: usageDate,
                SUBSCRIPTION_ID: "A-S00000240",
                CHARGE_ID: "",
                DESCRIPTION: ""

            });
        }

        writer.end();


        console.log("posting subscriptions");
        setTimeout(function() {
            var fs = require('fs');
            var request = require('request');
            console.log("uploading file for usage = " + fileName);
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

    });

    app.listen(port)
