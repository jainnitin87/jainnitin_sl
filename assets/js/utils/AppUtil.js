//
// Copyright (c) 2014 Nutanix Inc. All rights reserved.
//
// Collection of static utility functions which can be used by the rest of the
// app to perform common tasks.
//
/* jshint -W079 */

var AppUtil = {

  initialize: function() {
    this.log('AppUtil : Initializing')
  },

  uid: function(len) {
    var buf = []
      , alpha   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      , numeric = '0123456789'
      , special = '.-_~+/'
      , chars   = alpha + numeric // + special
      , charlen = chars.length

    for (var i = 0; i < len; ++i) {
      buf.push(chars[_.random(0, charlen -1)])
    }

    return buf.join('')
  },

  // Simple utility to get the current browser version. In most cases you
  // should be checking to see if a certain feature is supported but this can
  // be used during the exception cases. Since browser type cannot be reliably
  // detected via the user agent string, it uses duck-typing to determine this.
  //
  // @see http://stackoverflow.com/questions/9847580
  getBrowserType: function() {

    // Opera
    if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
      return 'opera'
    }
    // Firefox 1.0+
    if (typeof InstallTrigger !== 'undefined') {return 'firefox'}
    // Safari
    var HTMLElement = Object.prototype.toString.call(window.HTMLElement)
    if (HTMLElement.indexOf('Constructor') > 0) {return 'safari'}
    // Chrome 1+
    if (!!window.chrome) {return 'chrome'}
    // IE 6+
    if (/*@cc_on!@*/false || !!document.documentMode) {return 'ie'}

    return 'unknown'
  },

  parseFragmentToObject: function parseFragmentToObject(fragment) {
    // RegEx to match the desired components of a URL fragment of the form:
    // page/:pageId/:subPageId?options
    var re = /page\/(\w*)\/(\w*)\?(.*)/
    var match = fragment.match(re)
    var pageRoute = {
      pageId: match[1],
      subPageId: match[2],
      options: match[3]
    }

    return pageRoute
  },

  // Parses a URL query by converting it into an object.
  // e.g. actionTargetId=1&actionTarget=container becomes
  // {actionTargetId : '1', actionTarget:'container'}
  parseQueryToObject: function(query) {
    // Bail if no query was provided.
    if(!query) {return null}

    // Strip out the leading '?'
    query = query.replace(/^\?/, '')

    // Ensure there is at least one query string pair.
    var queryStringPairs = query.split('&')
    if(queryStringPairs.length === 1 && queryStringPairs[0] === '') {
      return null
    }

    // Build a query object from the query.
    var queryObject = {}
    _.each(queryStringPairs, function(item) {
      var queryItem = item.split('=')
        , queryKey = decodeURIComponent(queryItem[0])
        , queryVal = decodeURIComponent(queryItem[1])

      if(queryKey) {queryObject[queryKey] = queryVal}
    })

    return queryObject
  },

  // Parses an object by converting it into a query param.
  // e.g. {actionTargetId : '1', actionTarget:'container'} becomes
  // actionTargetId=1&actionTarget=container
  formatObjectToQuery: function(object) {
    // Bail if no object was provided.
    if(!object) {return null}

    // Build the query string from the object.
    var queryString = _.map(object, function(value, key) {
      return key + '=' + value
    }).join('&')
    queryString = queryString || ''

    return queryString
  },

  // Dynamically create a container for a popup
  // The popup will be responsible for destroying it.
  // @param containerId  - DOM id for the container (without a leading #)
  createPopupContainer: function(containerId) {
    // Make sure to remove any dangling divs
    $('#globalModalContainer  #'+containerId).remove()

    // Then let's create the popup
    var popupDiv = $('<div id="' + containerId + '" ' +
      ' class="n-modal"></div>')
    popupDiv.appendTo('#globalModalContainer')
    return popupDiv
  },

  // Show the loading spinner div
  addSpinner: function() {
    $('body').append(
      '<div id="spinner">' +
        '<img src="images/spinners/n-loading.gif"/>' +
      '</div>'
    )
  },

  // Hide the loading spinner div
  removeSpinner: function() {
    $('#spinner').remove()
  },

  // Show alert
  showAlert: function(msg, type, inPopup, timeOut) {
    timeOut = timeOut || 10000;

    var targetClass = '#n-header > .n-alert'

    if (inPopup) {
      targetClass = '.n-modal-body > .n-alert'
    }

    switch (type) {
      case 'success':
        $(targetClass).removeClass('n-fail n-info n-warning')
        .addClass('n-success')
        break
      case 'fail':
        $(targetClass).removeClass('n-success n-info n-warning')
        .addClass('n-fail')
        break
      case 'info':
        $(targetClass).removeClass('n-success n-fail n-warning')
        .addClass('n-info')
        break
      case 'warning':
        $(targetClass).removeClass('n-success n-fail n-info')
        .addClass('n-warning')
        break
    }
    $(targetClass + ' > .n-alert-message').html(msg)
    $(targetClass).slideDown(300)

    // TODO: Discuss alert behavior further with the team. I think no-timeout
    // should be the default behavior but I'm not sure how this change would
    // affect the app since all views may not call `dismissAlert()` once their
    // transaction is complete.
    if (timeOut !== 'none') {
      setTimeout(AppUtil.dismissAlert, timeOut)
    }
  },

  dismissAlert: function() {
    $('.n-alert').slideUp(300)
  },

  // Check if the browser is IE.
  // TODO: Consider alternate methods besides using the user agent.
  isIE: function() {
    var ua = window.navigator.userAgent,
        // For IE 10 and prior.
        msie = ua.indexOf('MSIE '),
        // For IE 11.
        trident = ua.indexOf('Trident/');

    return (msie !== -1 || trident !== -1);
  },

  // Calculate the days between the current and provided dates.
  calculateDaysRemaining: function(date) {
    var MILLIS_IN_DAY = 86400000;

    return Math.floor((
        // Note: licenseExpiry  is in milliseconds and new Date() returns
        // milliseconds.
        Date.parse(date) - (new Date()) ) / MILLIS_IN_DAY);
  },

  // Used for licensing. Calculate the license category from a set of license
  // models.
  calculateLicenseCategory: function(licenseCollection) {
    if (! licenseCollection) {
      DEBUG('AppUtil: calculateLicenseCategory: Invalid ' +
        'licenseCollection parameter.');
      return null;
    } else if (licenseCollection.length === 0) {
      return 'Starter';
    }

    var category = 'Ultimate';

    for (var index in licenseCollection.models) {
      var licenseModel = licenseCollection.models[index];

      if (! licenseModel.getCategory()) {
        return 'Starter';
      }

      if (licenseModel.getCategory() === 'Pro') {
        category = 'Pro';
      }
    }

    return category;
  },

  // Used for licensing. Calculate the license category from a set of license
  // models.
  calculateLicenseExpiration: function(licenseCollection) {
     return licenseCollection.reduce(function(expiry, licenseModel) {
       if (! expiry) {
         return licenseModel.get('licenseExpiry');
       } else if (licenseModel.getDaysRemaining() <
           this.calculateDaysRemaining(expiry)) {
         return licenseModel.get('licenseExpiry');
       } else {
         return expiry;
       }
     }, null, this);
  },

  // Find out the source of a given URL
  getSourceFromUrl: function(url) {
    var source = 'unknown'
    var searchCriteria = {
      cloudfront : 'download.nutanix.com',
      s3: 'ntnx-portal.s3.amazonaws.com'
    }

    _.each(searchCriteria, function(searchString, key, object) {
      source = (_.contains(url, searchString)) ? key : source
    })

    return source
  },

  // Returns a list of group IDs of the passed user object.
  getGroupIdsFromUserObject: function(object) {
    return _.reduce(object.get('groups'), function(memo, next) {
      memo.push(next.groupId)
      return memo
    }, [])
  },

  // Returns 'true' if the user belongs to a group from the passed 'groupIds'.
  // Parameters:
  // Input (groupIds) - an array of strings i.e. group ids to check against.
  // Input (userGroups) - an array of group objects that the user currently
  // blongs to. This information is obtained from the user's session.
  hasGroup: function(userGroups, groupIds) {
    var hasGroup = false
    _.each(userGroups, function(group) {
      if(_.contains(groupIds, group.groupId)) {
        hasGroup = true
      }
    })
    return hasGroup
  },

  // Returns the input string with its first letter capitalized.
  capitalizeFirstLetter: function(str) {
    var toMod = str || ''
    return toMod.charAt(0).toUpperCase() + toMod.slice(1)
  }
}
