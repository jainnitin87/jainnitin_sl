
// Initialize application singletons.
App.session = new App.Models.Session()
App.router = new App.Router()

// Start watching for hashchange events
Backbone.history.start()

/* Initialize Google Analytics
//GoogleAnalytics.initialize()

// Bind route changes to send page views to Google Analytics
Backbone.history.on('route', GoogleAnalytics.sendPageview)*/

// Start 'er up
App.router.initApp()
