
App.Models.App = App.Models.BaseModel.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // Class name for logging
  name: 'AppModel',

  // Track when this model has been fully initialized.
  initialized: false,

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function() {
    DEBUG('AppModel : Initializing')
    this.initialized = true
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Page Routes)

  getCurrentPageRoute: function() {
    DEBUG('AppModel : Getting current page route')

    return this.get('currentPageRoute')
  },

  setCurrentPageRoute: function(pageRoute) {
    DEBUG('AppModel : Setting current page route to ' + pageRoute.pageId)

    this.set('currentPageRoute', _.clone(pageRoute), {silent: true})

    // TODO: Move this functionality into BaseModel
    this.trigger('change.route', {})
  }

})
