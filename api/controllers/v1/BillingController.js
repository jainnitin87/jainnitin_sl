
module.exports = {
  
  getUnBilledAmount: function (req, res) {
    console.log('Geting getUnBilledAmount');
    var AccountId = req.param("AccountId");
    var TargetDate = req.param("TargetDate");
    console.log(AccountId,TargetDate);
    var payload = {

      
  
    requests:[{
      AccountId:AccountId,
      ChargeTypeToExclude:"OneTime,Recurring",
      TargetDate:TargetDate,
      IncludingEvergreenSubscription:true
    }]
  
};
    

    function processBillingPreview(err,result){

      if(!err){
        res.json(result);
      }
    }
    
    Utils.soap ('billingPreview', payload, processBillingPreview);
  }
};
