
App.Views.Header = App.Views.BaseView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // View template
  template: null,

  el: '#n-header',

  // Used to track the last scroll position for deciding if to show/hide header
  scrollLocation: null,

  isRendered: false,

  isPublicUserInfoMsgClosed: false,

  /////////////////////////////////////////////////////////////////////////////
  // DOM Events

  events: {

  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (View)

  initialize: function() {
    VERBOSE('HeaderView: Initializing')
    this.template = App.Templates['header/HeaderView']
  },

  render: function() {
    this.$el.html(this.template({
      firstName: App.session.user.get('firstName') || ''
    }))

    // Mark the view as rendered so AppView can avoid unnessary re-renders of
    // the header each time a new page is shown.
    this.isRendered = true

    return this.$el
  },

  /////////////////////////////////////////////////////////////////////////////
  // Event handlers

})
