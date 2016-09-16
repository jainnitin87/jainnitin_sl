// AppManager handles the AppView. This manager class can be called in any page
// and update the AppView.

App.AppManager = {

  //////////////////////////////////////////////////////////////////////////////
  // Functions

  // Refreshes the appView. This is called when an entity has been created/
  // updated from a popup.
  // - model  : The model that has been created/added
  refreshView: function(model) {
    // Call the global AppView object to refresh the view.
    App.router.appView.refreshView(model)
  }
}
