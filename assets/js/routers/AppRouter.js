App.Router = Backbone.Router.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // The view of the whole application
  appView: null,

  // Stores the current page route for reference and caching purpose.
  // It is an object that contains (1) pageId, (2) subPageId, (3) options
  pageRoute: null,

  // Stores the current action route for reference and caching purpose.
  // It is an object that contains (1) action, (2) actionTarget,
  // (3) actionTargetId
  actionRoute: null,

  // Latest page route
  latestPageRoute: null,

  // Latest query param
  latestQueryParamBeforeHash: null,

  /////////////////////////////////////////////////////////////////////////////
  // App Routes

  // page/cases/12345/new
  // page/cases?action=edit&actionTargetId=1234
  routes : {
    // Pages
    ''                                 : 'showPage',
    'xi/:pageId'                     : 'showPage',
    'xi/:pageId/:subPageId'          : 'showPage',
    'xi/:pageId/:subPageId/'         : 'showPage',
    'xi/:pageId/:subPageId?*options' : 'showPage',

    // Auth routes
    'login'                         : 'showLogin',
    'login?*options'                : 'showLogin',
    'logout'                        : 'showLogout',
    'logout?*options'               : 'showLogout',
    'signup'                        : 'showSignup',
    'signup?*options'               : 'showSignup',
    'resetPassword'                 : 'showResetPassword',
    'resetPassword?*options'        : 'showResetPassword',
    'resetPasswordConfirm'          : 'showResetPasswordConfirm',
    'resetPasswordConfirm?*options' : 'showResetPasswordConfirm',
    'verify'                        : 'showVerifyUser',
    'verify?*options'               : 'showVerifyUser',
    'error'                         : 'showError',
    'error?*options'                : 'showError'
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function() {
    DEBUG('AppRouter : Initializing')

    this.appView = this.initializeAppView()
  },

  // Instantiate and return the AppView
  initializeAppView: function(options) {
    return new App.Views.App()
  },

  // The initial function of building the web console. This initializes the
  // DataManager and gets the config properties first before rendering the
  // AppView.
  initApp: function() {
    // After initializing the service managers, then kickoff the app.
    DEBUG('AppRouter : Initializing application')
    this.appView.renderInit(this.pageRoute)
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Util)

  enforceHttps: function(cb) {
    // Only enforce HTTPS when the app is running in production mode.
    if (App.config.environment !== 'production') {return cb()}

    var requestProtocol = window.location.protocol
      , isHTTPS = requestProtocol === 'https:'
      , originalUrl = window.location.href
      , routeTo = 'https:' + originalUrl.substring(requestProtocol.length)

    // If the request protocol is HTTPS then continue to process the route.
    if (isHTTPS) {return cb()}

    // Otherwise, route all HTTP requests to the same origin but over HTTPS.
    window.location.href = routeTo
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Route Handlers)

  showPage: function(pageId, subPageId, options) {
    DEBUG('AppRouter : Handling page route for ' + pageId)
    var _this = this
    // TODO: Should migrate this logic to use the Q promise library like
    // the rest of the app.
    _this.enforceHttps(function() {
      // Update the route for paging.
      _this.pageRoute = {
        'pageId'    : pageId,
        'subPageId' : subPageId,
        'options'   : options
      }

      // Show the page.
      _this.appView.showPage(_this.pageRoute)
    })
  },

  showLogin: function(options) {
    var _this = this
    var forwardRoute = _this.pageRoute
    var optionsObj = AppUtil.parseQueryToObject(options) || {}
    _this.pageRoute = {pageId: 'login', options: options}

    // Ensure that a session data key is present. If not, then we need to
    // kick-off the oauth2 flow and bail in order to retrieve one. This key is
    // required by the IDP for brokered login.
    if (!optionsObj.sessionDataKey) {
      App.NavigationManager.redirectToUrl(AppConstants.OAUTH_URL)
      return
    }

    _this.enforceHttps(function() {
      // Render the login page
      _this.appView.renderLogin(forwardRoute, options)
    })
  },

  showLogout: function(options) {
    var _this = this
    _this.appView.renderLogout(_this.pageRoute, options)
  },

  showResetPassword: function(options) {
    var _this = this
    _this.pageRoute = {pageId: 'resetPassword', options: options}
    _this.appView.renderResetPassword(_this.pageRoute, options)
  },

  showResetPasswordConfirm: function(options) {
    var _this = this
    _this.pageRoute = {pageId: 'resetPasswordConfirm', options: options}
    _this.appView.renderResetPasswordConfirm(_this.pageRoute, options)
  },

  showVerifyUser: function(options) {
    var _this = this
    _this.pageRoute = {pageId: 'verifyUser', options: options}
    _this.appView.renderVerifyUser(_this.pageRoute, options)
  },

  showSignup: function(options) {
    var _this = this
    _this.pageRoute = {pageId: 'signup', options: options}
    _this.enforceHttps(function() {
      // Render the portal signup page
      _this.appView.renderSignup(_this.pageRoute)
    })
  },

  showError: function(options) {
    var _this = this
    _this.pageRoute = {pageId: 'error', options: options}
    _this.enforceHttps(function() {
      // Render the global error page
      _this.appView.renderError(_this.pageRoute)
    })
  }
})
