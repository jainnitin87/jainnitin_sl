/*jshint node:true */
/*jshint strict:false */
/* global SessionMgmt */
//var moment = require('moment');
module.exports = {
  _config: {
    model: 'Accounts'
  },
  test: function (req, res) {
    SessionMgmt.createZuoraSession();
    res.ok ({hello: 'world Session is created'});
  }
};
