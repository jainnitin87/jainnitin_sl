// Public generic error page

App.Views.Error = App.Views.BaseFormView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  pageId: 'n-error-wrapper',
  template: null,

  events: {
    'click #n-try-login-again': 'onLoginReattempt'
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function init() {
    VERBOSE('ErrorView: Initializing generic error page view ...')
    this.template = App.Templates['login/ErrorView']

    $('body').attr('class', 'page-error')
    this.$el.addClass('page-content')

    App.Views.BaseFormView.prototype.initialize.apply(this, arguments)
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Events)

  /**
   * Handle `back` button on form navigation.
   */
  onClickBack: function onClickBack(ev) {
    App.NavigationManager.navigateToRoute('/login')
  },

  /**
   * Reload the login page so that it does an oauth again the IDP and gets back
   * the session key and other details.
   */
  onLoginReattempt: function onLoginReattempt() {
    VERBOSE('ErrorView: Reloading the window')
    window.location.reload()
  }
})
