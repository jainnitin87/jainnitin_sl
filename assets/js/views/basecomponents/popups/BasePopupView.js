// Popups
App.Views.BasePopupView = App.Views.BaseView.extend({
  // PROBLEM in Backbone and Bootstrap Modal:
  // The core of the problem that people run in to when using a modal
  // dialog is that the modal plugin removes the DOM element that wraps the
  // modal, from the DOM. The problem that this usually causes is that a
  // Backbone view will lose it's event handling when the DOM element gets
  // moved around by the modal dialog.
  //
  // SOLUTION:
  // Don't modal a Backbone view, rather have a div tag in the global popup
  // container, that will contain the template.

  // Functions
  //----------

  // @override
  // NOTE: To be overridden by subclass
  initialize: function() {
  },

  // NOTE: To be overridden by subclass
  // Function called to show the popup.
  show: function(actionRoute) {
  },

  // NOTE: To be overridden by subclass
  // Function called to hide the popup.
  hide: function() {
  },

  // NOTE: To be overridden by subclass
  // Popup subclasses can override this to show a confirm dialog. If this
  // is overridden, make sure to return a boolean.
  confirmHide: function() {
    return true
  },

  // NOTE: To be overridden by subclass
  // Slides the content to show form and updates the footer and header
  // where in 'mode' is 'Create' or 'Edit'
  showForm: function(mode, isAnimate) {
  },

  // NOTE: To be overridden by subclass
  // Slides the content to show form and updates the footer and header
  showList: function() {
  },

  // NOTE: To be overridden by subclass
  // Function called to reset the popup.
  reset: function(actionRoute) {
  },

  // @override
  // Since all popups have a model, let's remove all event handlers.
  destroy: function() {
    // Remove event listeners from model if there's any
    if (this.model) {
      this.model.off()
    }

    // Call super where it undelegates view and model events.
    App.Views.BaseView.prototype.destroy.apply(this, arguments)
  },

  // Functions (Event Handlers)
  //---------------------------

  // Function called for key inputs
  onKeyPress: function(ev) {
    this.clearHeader()
    if(ev.keyCode === 13) {
      // If enter key is pressed.
      this.onEnterKeyPress()
      //Added to prevent the default event handling in chrome.
      ev.preventDefault()
    }
  },

  // Override this function to call your save function
  onEnterKeyPress: function() {
  },

  // Function called after popup has been shown
  onShown: function() {
  },

  // Function called after popup has been hidden
  onHidden: function() {
    // Destroy this popup view
    this.destroy()

    // Remove the DOM element
    this.$el.remove()
  },

  // Functions (Header Alerts)
  //--------------------------

  // Show a sub view, such as a form within the popup
  // By default we animate it to keep JC happy.
  // @param elementId - the div to be animated
  // @param direction - animation direction: 'left' or 'right'
  showSubview: function(elementId, direction) {
    // Default is 'right'
    var startXpos = direction === 'left' ? '600px' : '-560px'
    this.$(elementId).css({ 'left': startXpos })
    .show()
    .animate({ 'left': '0px'}, 500)
  },

  // Hide a sub view, such as a form within the popup
  // No animation, to keep Raj happy
  hideSubview: function(elementId) {
    this.$(elementId).hide()
  },

  // Scrolls to the bottom of the modal form.
  scrollToBottom: function() {
    var p = this.$('.n-modal-body')
    $(p).animate({ scrollTop: $(p).prop('scrollHeight') - $(p).height() },
      0, 'fast')
  },

  // Scrolls to top of the model form.
  scrollToTop: function() {
    var p = this.$el.closest('.n-modal-body')
    $(p).animate({ scrollTop: '0px' }, 'fast')
  },

  // Resets the top position by removing it from the inline style
  resetVerticalPosition: function() {
    this.$el.css('top', '')
  },

  // Clears the popup's header area of Error or Success messages
  clearHeader: function() {
    var _this = this
    this.$('.n-modal-alert-header').slideUp(300)
    this.$('.n-modal-alert-header').removeClass('not-empty')
  },

  // Show a notification, loading message, or other HTML
  // in the header
  _showHeader: function(headerHTML) {
    var _this = this
    this.$el.find('.n-modal-alert-header').html(headerHTML)
    this.$el.find('.n-modal-alert-header').slideDown(300)
    this.$el.find('.n-modal-alert-header').addClass('not-empty')
  },

  // Functions (AntiScroll)
  //-----------------------

  // Apply anti-scroll to the content with delay if specified.
  // @param delay  - set a delay
  // @param width  - antiscroll width
  // @param height - antiscroll height
  applyAntiScroll: function(delay, width, height) {
    if (delay) {
      var _this = this
      setTimeout( function() { _this._createAntiScroll(width, height) },
        delay)
    } else {
      this._createAntiScroll(width, height)
    }
  },

  // Create the anti-scroll to the modal body
  // @param width  - antiscroll width
  // @param height - antiscroll height
  _createAntiScroll: function(width, height) {
    width  = (width  || this.$('.n-modal-body').width())  + 'px'
    height = (height || this.$('.n-modal-body').height()) + 'px'
    AppUtil.applyAntiScroll( this.$('.antiscroll-wrap'), width, height)
    this.$('.antiscroll-wrap').css('visibility','visible')
  }
})
