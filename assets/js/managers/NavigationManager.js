
// NavigationManager handles the navigation functions of the application.

// TODO: Migrate navigation functionality here as needed or when time allows.

App.NavigationManager = {

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Page Routing)

  navigateToRouteObject: function(pageRoute) {
    // Ensure the route object is not null
    var _this = App.NavigationManager
    var pageId, subPageId, options
    if (pageRoute) {
      pageId = pageRoute.pageId
      subPageId = pageRoute.subPageId
      options = pageRoute.options
    }

    // Build the route string and navigate to it.
    var newPage = (pageId) ? pageId : ''
      , newSubPage = (subPageId) ? '/' + subPageId : ''
      , newOptions = (options) ? '?' + options : ''

    _this.navigateToRoute(newPage + newSubPage + newOptions)
  },

  navigateToPageRouteObject: function(pageRoute) {
    // Check if page is not null
    var _this = App.NavigationManager
    var pageId, subPageId, options
    if(pageRoute) {
      pageId = pageRoute.pageId
      subPageId = pageRoute.subPageId
      options = pageRoute.options
    }
    _this.navigateToPage(pageId, subPageId, options)
  },

  navigateToPage: function(pageId, subPageId, options) {
    // Ensure the options given are formatted as a string
    if (typeof(options) === 'object') {
      options = AppUtil.formatObjectToQuery(options)
    }

    // Navigate to new route
    var _this = App.NavigationManager
    var newPage    = (pageId) ? 'xi/' + pageId : ''
      , newSubPage = (subPageId) ? '/' + subPageId : ''
      , newOptions = (options) ? '?' + options : ''
    _this.navigateToRoute(newPage + newSubPage + newOptions)
  },

  navigateToRoute: function(url) {
    // If same URL, refresh the route
    if(Backbone.history.fragment === url) {
      Backbone.history.loadUrl(Backbone.history.fragment)
    }else {
      Backbone.history.navigate(url, {trigger: true})
    }
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Window)

  // Refresh and navigate to the console's base URL.
  refreshToBaseURL: function(options) {
    if(window.location.href.split('#')[0]) {
      // Get the base URL
      var baseURL = window.location.href.split('#')[0],
          params = options ? ('?' + options) : ''
      window.location.href = baseURL + params
    }
  },

  redirectToUrl: function(url) {
    window.location = url
  }
}
