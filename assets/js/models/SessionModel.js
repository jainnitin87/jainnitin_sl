
// TODO: Maybe move this to LoginManager
App.Models.Session = App.Models.BaseModel.extend({

  // Initialize with negative/empty defaults
  // These will be overriden after the initial checkAuth
  defaults: {
    loginStatus: false,
    userId: ''
  },

  initialize: function() {
    // Singleton user object
    // Access or listen on this throughout any module with app.session.user
    this.user = new App.Models.User()
  },

  url: function() {
    return '/api/v1/auth'
  },

  // Fxn to update user attributes after recieving API response
  updateSessionUser: function(userData) {
    VERBOSE('Updating session user')
    this.user.set(userData)
  },

  /*
   * Check for session from API
   * The API will parse client cookies using its secret token
   * and return a user object if authenticated
   */
  checkAuth: function(callback, args) {
    VERBOSE('Checking authentication token')

    var self = this
    this.fetch({
      success: function(user, res) {
        self.user = user
        self.set({loginStatus: true})
        callback.success()
      },
      error: function(mod, res) {
        self.set({loginStatus: false})
        if ('error' in callback) {callback.error()}
      }
    }).done(function() {
        if ('complete' in callback) {callback.complete()}
    })
  },

  /*
   * Abstracted fxn to make a POST request to the auth endpoint
   * This takes care of the CSRF header for security, as well as
   * updating the user and session after receiving an API response
   */
  postAuth: function(opts, callback, args) {
    var self = this
    var postData = _.omit(opts, 'method')
    DEBUG('SessionModel: Processing POST auth method: ' + opts.method)
    VERBOSE(postData)

    $.ajax({
      url: this.url() + '/' + opts.method,
      contentType: 'application/json',
      dataType: 'json',
      type: 'POST',
      beforeSend: function(xhr) {
        // TODO: Investigate CSRF implementation
        // Set the CSRF Token in the header for security
        //var token = $('meta[name="csrf-token"]').attr('content')
        //if (token) xhr.setRequestHeader('X-CSRF-Token', token)
      },
      data: JSON.stringify(_.omit(opts, 'method')),
      success: function(res, textStatus, jqXHR) {
        res = res || {}
        if(_.contains(['login'], opts.method)) {
          self.updateSessionUser(res.user || {})
          self.set({userId: res.user.id, loginStatus: true})

          // set user contact id on google analytics
          GoogleAnalytics.setTrackingIDs(res.user.id, res.user.accountId,
            res.user.contactId)
          // send user login event to ga
          GoogleAnalytics.logPortalLogin()
        } else {
          self.set({loginStatus: false})
        }
        if (callback && 'success' in callback) {callback.success(res)}
      },
      error: function(jqXHR, textStatus, errorThrown){
        if (callback && 'error' in callback) {callback.error(jqXHR)}
      }
    }).complete(function(res) {
      if (callback && 'complete' in callback) {callback.complete(res)}
    })
  },

  login: function(opts, callback, args){
    this.postAuth(_.extend(opts, {method: 'login'}), callback)
  },

  logout: function(opts, callback, args){
    // Destroy auth cookies
    this.postAuth(_.extend(opts, {method: 'logout'}), callback)
  },

  signup: function(opts, callback, args){
    this.postAuth(_.extend(opts, {method: 'signup'}), callback)
  },

  lookupSerial: function(opts, callback, args){
    this.postAuth(_.extend(opts, {method: 'requestSerialNumber'}), callback)
  },

  forgotPassword: function(opts, callback, args){
    this.postAuth(_.extend(opts, {method: 'requestPasswordReset'}), callback)
  },

  resetPassword: function(opts, callback, args){
    this.postAuth(_.extend(opts, {method: 'resetPassword'}), callback)
  },

  isLoggedIn: function() {
    return this.get('loginStatus')
  }
})
