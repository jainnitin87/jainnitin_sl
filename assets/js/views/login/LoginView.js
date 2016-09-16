

App.Views.Login = App.Views.BaseFormView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  pageId: 'login-container',
  template: null,
  forwardRoute: null,
  redirectTo: null,
  options: null,
  commonauthUrl: null,

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function() {
    VERBOSE('LoginView: Initializing.')
    this.template = App.Templates['login/LoginView']
    this.util = new App.Models.Util()

    $('body').attr('class', 'page-login')
    this.$el.addClass('page-content')

    // Extend the default view events
    this.events = _.extend({}, this.events, {
      'click #login-submit': 'onFormSubmit',
      'keypress input[type="password"]': 'onFormSubmit'
    })

    App.Views.BaseFormView.prototype.initialize.apply(this, arguments)
  },

  setForwardRoute: function(forwardRoute) {
    this.forwardRoute = forwardRoute
  },

  onFormSubmit: function(ev) {
    // For key presses, only process the submission if the enter key was hit.
    if (ev.type === 'keypress' && ev.keyCode !== AppConstants.ENTER_KEY) {
      return
    }

    // Iterate through all of the form input fields and trim their values to
    // remove any special characters.
    this.$('input').each(function(idx, item) {
      item.value = item.value.trim()
    })

    ev.preventDefault()

    this.$('#login-form').submit()
  },

  setOptions: function(options) {
    this.options = (typeof options === 'string') ?
        AppUtil.parseQueryToObject(options) :
        options
  },

  setCommonauthUrl: function() {
    var _this = this

    return _this.util.getCommauthUrl()
      .then(function(result) {
        // TODO: Add response validation with something like
        // `result.hasOwnProperty('url')` that throws a reasonable error.
        DEBUG('setting commonauth ' + result.url)
        _this.commonauthUrl = result.url
      })
  },

  render: function(options) {

    var props = _.extend(this.options, {
      url: this.commonauthUrl
    })

    var html = this.template(props)

    this.$el.attr('id', this.pageId)
    this.$el.html(html)

    return this.el
  }
})
