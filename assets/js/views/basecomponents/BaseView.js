
App.Views.BaseView = Backbone.View.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // @private
  // NOTE: Used for option handling
  // Stores the current options as an object with key-value pairs from the
  // query string of 'currentOptions'.
  _optionsObject: null,

  // Track the current state of services.
  servicesStarted: false,

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  // TODO: We should consolidate this logic here since this functionality is
  // duplicated here and in BasePageView.
  show: function() {
    // Show the page nav if needed
    $('header > .page-nav')[(this.showPageNav) ? 'show' : 'hide']()
    this.$el.show()
  },

  hide: function() {
    this.$el.hide()
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Services)

  // Restarts the services of the view if the state of the services is
  // already running.
  // @param forceStart - Set to true to by-pass the check
  restartServices: function(forceStart) {
    if (forceStart || this.servicesStarted) {
      this.setServicesState(true)
      this.onStartServices()
    }
  },

  // Starts all services that are related to the page (e.g. real-time stats
  // timers, charting)
  startServices: function() {
    // Calling `this.setServiceState` returns false if the previous service
    // state is stopped. This prevents calling to start services twice.
    if (this.setServicesState(true)) {return}

    this.onStartServices()
  },

  // Halts all services that are related to the page (e.g. event listeners)
  stopServices: function() {
    // Calling `this.setServiceState` returns true if the previous service
    // state is running. This prevents calling to stop services twice.
    if (this.setServicesState(false)) {
      this.onStopServices()
    }
  },

  // NOTE: Meant to be overridden
  // Override this function when the view's services are ready to be started.
  onStartServices: function() {
  },

  // NOTE: Meant to be overridden
  // Override this function when the view's services are ready to be stopped.
  onStopServices: function() {
  },

  // Set the current state of the services and return the previous value.
  // @param state - set the current state to this value
  setServicesState: function(state) {
    var previous = this.servicesStarted
    this.servicesStarted = state
    return previous
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Destroy)

  // This is a common cleanup API. All views should call this API from their
  // destroy function.
  destroy: function() {
    VERBOSE('BaseView:  destroying ' + this.cid)
    this.remove()
    this.unbind()
    this.stopListening()
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Options)

  // NOTE: Don't override this
  // Parses the options parameter to create an object that will store the
  // properties that will be interpreted by the subclass.
  parseOptions: function(options) {
    this.currentOptions = options;
    this._optionsObject = AppUtil.parseQueryToObject(options)
  },

  // NOTE: Don't override this
  // Returns the optionsObject
  getOptionsObject: function() {
    return this._optionsObject
  },

  // NOTE: Don't override this
  // Returns true if the options object is not null
  isValidOptionsObject: function() {
    return this._optionsObject !== null
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Model Events)

  // Registers the subView to this view's subViewHelper. It also returns
  // the registered subView.
  registerSubView: function(id, subView) {
    if (!this.subViewHelper) {
      throw new Error('This view\'s subViewHelper is not instantiated.')
    }
    if (!subView) {
      throw new Error('subView is not instantiated.')
    }
    this.subViewHelper.register(id, subView)
    return subView
  },

  // Returns the subView from this view's subViewHelper.
  getSubView: function(id) {
    if (!this.subViewHelper) {
      throw new Error('subViewHelper is not instantiated.')
    }
    return this.subViewHelper.get(id)
  },

  // Remove a subView from this view's subViewHelper.
  removeSubView: function(id) {
    if (!this.subViewHelper) {
      throw new Error('subViewHelper is not instantiated.')
    }
    return this.subViewHelper.remove(id)
  },

  // NOTE: To be overridden by subclass
  // Refreshes the view with new data. This is usually called when an
  // update/create action happens.
  refreshView: function() {
  },

  applyFancySelect: function() {
    // Initialize fancy select elements in the view.
    this.$('select').nutanixInput({type:'select'})
  }

})
