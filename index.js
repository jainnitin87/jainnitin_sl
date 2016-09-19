var express = require('express');
var port = process.env.PORT || 8080;
var request = require('request');

console.log("added express")
var app = express();
console.log("got express")

app.get('/test123', function(req, res) {
    console.log("hit the end point");
    //getZuoraSignature();
    res.sendfile('static/static.html', {
        root: __dirname
    });
});


app.get('/api/v1/getZuoraSignature',function(req,res){
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
    }, function (err, res1, body) {
        if (err) {  
                return console.error('failed to get the signature', err); 
        } 
        console.log('Got the signature', body);
        res.send(body);
    }).auth('nitin.jain@nutanix.com', 'Nutanix1');
});


app.listen(port);