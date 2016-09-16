/*jshint node:true */
/*jshint strict:false */
/*global sails, Utils */
module.exports = {
  processSession: function (err, result) {
    var zuoraConfig = sails.config.zuora;
    if (!err) {
      result = result && result.result;
      zuoraConfig.Custom.session = result && result.Session;
      zuoraConfig.Custom.sessionLastUpdated = Date.now();
    }
  },
  createZuoraSession: function () {
    var zuoraConfig = sails.config.zuora,
        username = zuoraConfig.username,
        password = zuoraConfig.password,
        payload;

    payload = {
      username: username,
      password: password
    };

    Utils.soap ('login', payload, this.processSession);
  }
};
