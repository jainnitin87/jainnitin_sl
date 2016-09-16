//
// Copyright (c) 2014 Nutanix Inc. All rights reserved.
//
/* global console: false */
/* jshint -W079 */

// TODO: Need to investigate a way to implement inspection of the caller. The
//  current problem is that when calling this custom logger, all console
//  output shows as coming from this class instead of the line number of
//  where it's being called from.
var AppLogger = function(options) {
  // TODO: This should be an optional param and apply a default is no value was
  // provided during initialization.
  this.logLevel = options.logLevel

  var msgPadding = '  '
  var colors = {
    grey      : '#333436',
    lightGrey : '#89949B',
    green     : '#A3C784',
    orange    : '#FFD522',
    blue      : '#0073BE',
    red       : '#DF4E5A',
  }
  var logInfo = {
    verbose : {level: 1, name: 'verbose', color: colors.lightGrey},
    debug   : {level: 2, name: 'debug',   color: colors.blue},
    info    : {level: 3, name: 'info',    color: colors.green},
    warn    : {level: 4, name: 'warn',    color: colors.orange},
    error   : {level: 5, name: 'error',   color: colors.red},
    fatal   : {level: 6, name: 'fatal',   color: colors.red}
  }

  /////////////////////////////////////////////////////////////////////////////
  // Functions

  this.write = function(msgType, msg) {
    // Bail if no console is available.
    if(typeof console === 'undefined') {return}

    // Silence log messages based on the current log level.
    if(logInfo[msgType].level < logInfo[this.logLevel].level) {return}

    // Currently, only Chrome supports colorization of output to the console so
    // we set `{colorize:false}` for all other browsers. Additionally, not all
    // browsers setup the `console` global to extend from `Object` and as a
    // result methods from `Function` are not inherited. Since access to
    // `Function.prototype.apply()` is required, we need to explicitly bind
    // this method to the console object for browser compatibility reasons.
    var opts = {colorize: (AppUtil.getBrowserType() === 'chrome')}
      , logConsole = _getConsole(msgType)
      , logArgs = _buildLogArgs(msgType, msgPadding, msg, opts)
      , log = Function.prototype.bind.call(logConsole, console)

    log.apply(console, logArgs)
  }

  this.verbose = function(msg) {this.write('verbose', msg)}
  this.info    = function(msg) {this.write('info',    msg)}
  this.debug   = function(msg) {this.write('debug',   msg)}
  this.warn    = function(msg) {this.write('warn',    msg)}
  this.error   = function(msg) {this.write('error',   msg)}
  this.fatal   = function(msg) {this.write('fatal',   msg)}

  /////////////////////////////////////////////////////////////////////////////
  // Functions (private)

  function _getConsole(msgType) {
    var consoles = {
      verbose : console.log,
      debug   : console.log,
      info    : console.info,
      warn    : console.warn,
      error   : console.error,
      fatal   : console.error
    }

    return consoles[msgType]
  }

  function _buildLogArgs(msgType, msgPadding, msg, options) {
    var msgPrefix = ''
      , prefixSeparator = '|'
      , logArgs = []

    // Build a standard log message which include an informative prefix based
    // on the message's log level. For example,
    //   $ DEBUG('My debug message')
    //   >>> 05:45:30|debug|   My debug message
    if (!options.colorize) {
      msgPrefix += [
        moment().format('hh:mm:ss'),
        logInfo[msgType].name
      ].join(prefixSeparator)

      // Add the trailing separator and padding before returning the message.
      msg = msgPrefix + prefixSeparator + msgPadding + msg

      // Return a list with one element, the message. This is required because
      // we're using `.apply` to set the colorized values when needed and this
      // function takes an argument list as it's params.
      return [msg]
    }

    // Otherwise, transform the message into a colorized log message using the
    // same formatting as the standard message based on the loglevel.
    // Colorization is achieved by wrapping the portions to colorize in `%c`
    // tags which will apply CSS to the log message. For example,
    // executing `console.log("%c my message", "color: #009900")` will apply
    // the CSS provided in the second arg to all text following the `%c`
    // formatting tag.
    //
    // @see https://developer.chrome.com/devtools/docs/console-api
    //
    var msgComps = [
      {color: colors.lightGrey, str: moment().format('hh:mm:ss')},
      {color: logInfo[msgType].color, str: logInfo[msgType].name}
    ]

    // Build colorized log message
    _.each(msgComps, function(item, index, list) {
      // Apply the message padding to the last prefix element. Since calling
      // `console.log` with multiple args automatically inserts one space of
      // padding between them we'll use `padding - 1` here in order to keep the
      // display consistent.
      if(index === list.length - 1) {
        var padding = msgPadding.substring(0, msgPadding.length - 1)
        prefixSeparator = prefixSeparator + padding
      }
      msgPrefix += '%c' + item.str + '%c' + prefixSeparator

      // Maintain a list of CSS args to be applied to formatted message.
      logArgs.push('color: '+ item.color, 'color: ' + colors.lightGrey)
    })

    // Add the formatted string as the first argument and then append the
    // message to be logged. (Ex. [format string, css, message])
    logArgs.unshift(msgPrefix)
    logArgs.push(msg)

    return logArgs
  }
}
