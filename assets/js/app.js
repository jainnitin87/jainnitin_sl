/*global logger*/

// Initialize the application logger and alias it's common methods within the
// global scope for simplicity.
// TODO: The log level should be a config item.
window.logger  = new AppLogger({logLevel: 'verbose'})
window.VERBOSE = _.bind(logger.verbose, logger)
window.INFO    = _.bind(logger.info,    logger)
window.WARN    = _.bind(logger.warn,    logger)
window.DEBUG   = _.bind(logger.debug,   logger)
window.ERROR   = _.bind(logger.error,   logger)
window.FATAL   = _.bind(logger.fatal,   logger)

// Initialize the global application namespace.
window.App = window.App || {}
window.App.Models = {}
window.App.Collections = {}
window.App.Views = {Popups: {}}
window.App.Utils = {}
