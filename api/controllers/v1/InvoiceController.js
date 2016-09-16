
module.exports = {
  
  getInvoices: function (req, res) {

    var accountId = req.param("accountId") || "2c92c0f9567df7880156946f9b4e3027";
    var request = require('request');
    request.get({url:'https://apisandbox-api.zuora.com/rest/v1/transactions/invoices/accounts/'+accountId}, 
      function invoiceCallback(err, httpResponse, body) {
         if (err) {
           return console.error('upload failed:', err);
         }
            res.json(JSON.parse(body));
        }).auth('nitin.jain@nutanix.com', 'Nutanix1');
    
  },

  getInvoiceFile: function(req, res) { 
      var path = req.param("url") || "https://apisandbox-api.zuora.com/rest/v1/files/2c92c08b567dfcfe0156947881522576";
      var request = require('request');
      //request.get({url:path},   
      //function invoiceCallback(err, httpResponse, body) {
      //   if (err) {
      //     return console.error('upload failed:', err);
      //   }
      //      res.setHeader("content-type","application/pdf");
      //      res.json(body);
      //  }).auth('nitin.jain@nutanix.com', 'Nutanix1');

      //var r = request("https://apisandbox-api.zuora.com/rest/v1/files/2c92c08b567dfcfe0156947881522576").auth('nitin.jain@nutanix.com', 'Nutanix1').pipe(fs.createWriteStream('./download.pdf'));
      // r.on('close', function() {});
      // r.on('error', function() {});
      // setTimeout(function() {
      //     res.download('download.pdf');
      // }, 1000);

        request.get({
               url: path,
               encoding: 'base64'
           },
           function invoiceCallback(err, httpResponse, body) { 
               if (err) {  
                   return console.error('upload failed:', err); 
               }
               res.setHeader("content-type", "application/pdf");
               res.end(body, 'base64');

           }).auth('nitin.jain@nutanix.com', 'Nutanix1');

  }
};
