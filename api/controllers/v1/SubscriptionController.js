/**
 * SubscriptionController
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    _config: {
        model: 'Subscription'
    },
    subscribe: function(req, res) {
        console.log("posting subscriptions");
        Subscription.create({
            "accountKey": req.param("accountKey"),
            "termType": req.param("termType"),
            "contractEffectiveDate": req.param("contractEffectiveDate"),
            "initialTerm": req.param("initialTerm"),
            "renewalTerm": req.param("renewalTerm"),
            "autoRenew": req.param("autoRenew"),
            "subscribeToRatePlans": req.param("subscribeToRatePlans")
        }).exec(function(err, data) {
          console.log(data);
            if (err || !data.success) {
                res.json({
                    'error': 'error subscribing'
                });
                return;
            }
            res.json(data);

          });


    }

};