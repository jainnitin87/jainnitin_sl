#!/usr/bin/env node

var pg = require('pg');
var moment = require('moment')
var request = require('request')

var connectionString = process.env.DATABASE_URL || 'postgres://u5hu90vmsdpiii:pasajqaftv96045249iahjehpfl@ec2-54-204-47-38.compute-1.amazonaws.com:5872/d8flqqgs1o4cu9?ssl=true';

var client = new pg.Client(connectionString);
client.connect(function(response) {
    //truncateUsage();
    insertDummyData(30);
    processUsage();

    function killConnection() {
        client.end();
    }

    function processUsage() {
        var query = client.query('SELECT * FROM xi_usage where status = $1', ["NEW"]);
        query.on('end', function(data) {
            console.log(data.rows.length);
            var query = client.query('UPDATE xi_usage set status = $1 where status = $2', ["QUEUED", "NEW"]);
            query.on('end', function(res) {
                console.log(res);
                writeUsageToCsv(data.rows);
            });
        });
    }

    function writeUsageToCsv(usageArray) {
        var csvWriter = require('csv-write-stream');
        var fileName = 'usageData/' + (new Date()).getTime() + '.csv';
        var fs = require('fs');
        var writer = csvWriter();
        writer.pipe(fs.createWriteStream(fileName, {}));

        for (var i = 0; i < usageArray.length; i++) {
            writer.write({
                ACCOUNT_ID: usageArray[i].accountid,
                SUBSCRIPTION_ID: "A-S00000344",
                UOM: usageArray[i].uom,
                QTY: usageArray[i].qty,
                STARTDATE: moment(usageArray[i].StartDateTime).format("MM/DD/YYYY"),
                ENDDATE: moment(usageArray[i].EndDateTime).format("MM/DD/YYYY"),
                CHARGE_ID: "",
                DESCRIPTION: usageArray[i].description
            });
        }

        postToZuora(fileName, usageArray);
        writer.end();
    }

    function insertDummyData(count) {
        var queryString = 'INSERT INTO xi_usage (qty, uom, status,"meteredItem", description,accountid,"StartDateTime","EndDateTime") values (\'23\',\'GB\',\'NEW\',\'VMS\',\'test usage\',\'A00000394\',\'2015-01-01\',\'2016-12-12\') ';
        for (var i = 0; i < count - 1; i++) {
            queryString += ', (\'23\',\'GB\',\'NEW\',\'VMS\',\'test usage\',\'A00000394\',\'2015-01-01\',\'2016-12-12\') ';
        }
        var query = client.query(queryString);
        query.on('end', function(res) {
            console.log("added rows with count " + res.rowCount);

        });
    }

    function postToZuora(fileName, usageArray) {

        setTimeout(function() {
            var fs = require('fs');

            var formData = {
                file: fs.createReadStream(fileName, {})
            };
            request.post({
                url: 'https://apisandbox-api.zuora.com/rest/v1/usage',
                formData: formData,
            }, function callback(err, httpResponse, body) { 
                body = JSON.parse(body);
                if (err) {  
                    console.log('upload failed:', err); 
                    return;
                } else if (body && body.checkImportStatus) {
                    console.log('Request sent to Zuora');
                    parseZuoraResponse(body.checkImportStatus, usageArray);
                } 
                else {
                    console.log("error with file : " + fileName);
                }

            }).auth('nitin.jain@nutanix.com', 'Nutanix1');
        }, 2000);

    }

    function parseZuoraResponse(statusUrl, usageArray) {
        var self = this;
        console.log("checking status of url = " + statusUrl);
        request.get({
            url: statusUrl
        }, function callback(err, httpResponse, body) {
            if (!err) {
                body = JSON.parse(body);
                if (body && body.success) {
                    updateUsageStatus(usageArray, "SUCCESS");
                } else {
                    updateUsageStatus(usageArray, "FAILED");
                }
            }
        }).auth('nitin.jain@nutanix.com', 'Nutanix1');
    }

    function updateUsageStatus(usageArray, status) {
        console.log("setting status to " + status);
        var ids = Object.keys(usageArray).map(function(e) {
            return usageArray[e].id });
        var query = client.query('SELECT * from xi_usage WHERE id = ANY($1::int[])', [ids]);
        query.on('end', function(res) {
            console.log("updated rows count " + res.rowCount + " with status = " + status);
            killConnection();

        });
    }

    function truncateUsage() {
        client.query("truncate xi_usage");
    }
});
