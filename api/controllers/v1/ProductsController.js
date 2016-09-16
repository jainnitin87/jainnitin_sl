/**
 * ProductsController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  _config: {
    model: 'Products'
    },
    getProducts:function(req,res){
      console.log("getting zuora products");

      Products.find().exec(function(err,data){
        if(err || data.length == 0 || 
          data[0].products.length ==0){
          res.json({'error':'error fetching products or no products present'});
          return;
        }
        for(var i=0;i<data[0].products.length;i++){
          if(data[0].products[i].name == "Xi"){
            res.json(data[0].products[i].productRatePlans);
            return;
          }
        }
        
      });
    }


};