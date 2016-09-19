var express = require('express');
var port = process.env.PORT || 8080;
var request = require('request');

console.log("added express")
    var app = express();
    console.log("got express")

    app.get('/test123', function(req, res){
    	console.log("hit the end point")
        res.sendfile('static/static.html', {root: __dirname });

        


    });

    app.listen(port)
