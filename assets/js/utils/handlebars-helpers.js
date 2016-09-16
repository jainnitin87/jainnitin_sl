//
// Copyright (c) 2014 Nutanix Inc. All rights reserved.
//
// A collection of simple handlebars utils which make our lives easier.
//


/**
 * Truncates a priority string from Salesforce into short format.
 *
 * This helper produces the short version of a Salesforce case priority
 * string. The full string contains {priority_level} - {description} in order
 * to provide customers with clarity on the significance of each level. This
 * long description isn't always desired though, for instance, in tables.
 */
Handlebars.registerHelper('shortPriority', function(priority) {
  return priority.split('-')[0].replace(' ', '')
})


/**
 * Maps a priority to it's corresponding color.
 */
Handlebars.registerHelper('priorityColor', function(priority) {
  priority = priority.split('-')[0].replace(' ', '').toLowerCase()
  var colorMap = {
    'p1': 'n-red',
    'p2': 'n-yellow',
    'p3': 'n-green',
    'p4': 'n-gray'
  }
  return colorMap[priority]
})

/**
 * Maps a case status to it's corresponding color.
 */
Handlebars.registerHelper('statusColor', function(status) {
  status = status.toLowerCase()
  var colorMap = {
    'unassigned': 'n-gray',
    'support agent assigned': 'n-blue',
    'support agent working': 'n-blue',
    'waiting for customer': 'n-yellow',
    'support agent working - resp provided': 'n-yellow',
    'pending third party': 'n-yellow',
    'waiting for parts dispatch': 'n-yellow',
    'stalled - awaiting patch/future release': 'n-yellow',
    'resolved - waiting for customer approval': 'n-yellow',
    'escalated to engineering': 'n-red',
    'closed': 'n-green',
    'closed - could not resolve': 'n-green',
    'closed - duplicate': 'n-green',
    'closed - by customer': 'n-green',
    'closed - rfe': 'n-green'
  }
  return colorMap[status]
})

/**
 * Formats the support contract coverage label
 */
Handlebars.registerHelper('contractCoverageLabel', function(coverage) {
  var labelMap = {
    'Gold: 8x5 service; NBD parts': 'Gold Service',
    'Platinum: 24x7 service; NBD parts': 'Platinum Service',
    'Platinum Plus: 24x7 service; 4hr parts': 'Platinum Plus Service',
    'Reseller does L1/L2 & Break-fix' : 'Reseller does L1/L2 & Break-fix',
    'Reseller does L1/L2' : 'Reseller does L1/L2',
    'Standard Warranty' : 'Standard Warranty',
    'NFR Warranty (Partner)' : 'NFR Warranty',
    'Unknown' : 'Unknown'
  }
  return labelMap[coverage]
})

/**
 * Maps a support contract status to it's corresponding color.
 */
Handlebars.registerHelper('contractStatusColor', function(contractStatus) {
  var colorMap = {
    'Under Support': 'n-green',
    'No Support Contract': 'n-gray',
    'EXPIRED': 'n-gray'
  }
  return colorMap[contractStatus]
})

/**
 * Formats the contract status label based on status and expiration date
 */
Handlebars.registerHelper('contractStatusLabel', function(contractStatus,
  expirationDate) {
  var date = expirationDate
    , fmt  = 'M/D/YYYY'

  // Check if date was provided as a Unix timestamp
  if(typeof date === 'number') {
    date = moment.unix(date).format(fmt)
  } else {
    // Otherwise, attempt to parse it as a date string
    date = moment(expirationDate).format(fmt)
  }

  var labelMap = {
    'Under Support': 'Expires ' + date,
    'No Support Contract': 'No Contract',
    'EXPIRED': 'Expired'
  }

  return labelMap[contractStatus]
})

/**
 * Truncates a string to a given length.
 */
Handlebars.registerHelper('truncate', function(str, block) {
  // Don't break if someone supplies an empty string.
  if (!str) {return ''}
  if (str.length > block.hash.len) {
    return str.substring(0, block.hash.len) + '...'
  }else{
    return str
  }
})

/**
 * Check if user has a specific permission.
 */
Handlebars.registerHelper('hasPermission', function(model, action, options) {
  var hasPermission = false
  _.each(App.session.user.get('groups'), function(group) {
    if (_.has(group.permissions, model)) {
      hasPermission = _.contains(group.permissions[model].actions, action)
    }
  })
  return (hasPermission) ? options.fn(this) : options.inverse(this)
})

/**
 * Check if user has a specific group.
 */
Handlebars.registerHelper('hasGroup', function(groupIds, options) {
  var hasGroup = false
  _.each(App.session.user.toJSON().groups, function(group) {
    if (groupIds.indexOf(group.groupId) !== -1) {
      hasGroup = true
    }
  })
  if(hasGroup) {
    return options.fn(this)
  }else {
    return options.inverse(this)
  }
})


/**
 * usage: {{dateFormat creation_date format="MMMM YYYY"}}
 */
Handlebars.registerHelper('dateFormat', function(context, block) {
  var date = context
    , fmt  = block.hash.format || 'MMM Do, YYYY'

  // Bail if no date was given
  if (!date) {return}

  // Check if date was provided as a Unix timestamp
  if (typeof date === 'number') {return moment.unix(date).format(fmt)}

  // Otherwise, attempt to parse it as a date string
  return moment(context).format(fmt)
})

/**
 * Loops through the array and gives the first, last and index of
 * an element in the array.
 */
Handlebars.registerHelper('foreach', function(arr, options) {
    if(options.inverse && !arr.length) {return options.inverse(this)}

    return arr.map(function(item,index) {
        item.$index = index
        item.$first = index === 0
        item.$last  = index === arr.length-1
        return options.fn(item)
    }).join('')
})

/**
 * Provides a way to add the attribute 'selected' to a pick-list.
 */
Handlebars.registerHelper('isSelected', function(first, second) {
  if(first === second) {
    return 'selected'
  }
})

/**
 * Provides a way to compare two values in a 'if' condition.
 */
Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})

/**
 * Converts a KB article's voteStats object to a star rating from 0-5
 */
Handlebars.registerHelper('getDownloadUrlName', function(downloadUrl) {
  if(downloadUrl === '') {return}

  var urlName = ''
  var index = downloadUrl.lastIndexOf('/')
  urlName = downloadUrl.substring(index + 1)
  return urlName
})

/**
 * Converts a KB article's voteStats object to a star rating from 0-5
 */
Handlebars.registerHelper('getKBStarRating', function(voteStats) {
  if (!voteStats) {return 0}

  return Math.round($.grep(voteStats, function(v){
    return v.channel === 'AllChannels'
  })[0].normalizedScore)
})

/**
 * Sets the KB visibility label
 */
Handlebars.registerHelper('getKbVisibility', function(customer, partner) {
  if (customer) {return 'All Users'}
  if (partner) {return 'Partners'}
  return 'Internal'
})

/**
 * useage: {{convertBytes numBytes numDigits=2}}
 */
Handlebars.registerHelper('convertBytes', function(numBytes, options) {
  var _options = options.hash || {}
    , symbolList = ['KB', 'MB', 'GB']
    , numDigits = _options.numDigits || 2
    , value
    , prefix = {}

  // Build a mapping of unit symbol to size in bytes.
  _.each(symbolList, function(symbol, index) {
    prefix[symbol] = 1 << (index + 1) * 10
  })

  // Iterate through all possible file size symobols and convert bytes to the
  // highest possible unit of measurement.
  _.each(symbolList.reverse(), function(symbol) {
    if(numBytes >= prefix[symbol]) {
      // Convert bytes to unit of this iteration
      value = numBytes / prefix[symbol]
      // Round the value to the number of digits provided
      value = Number(Math.round(value + 'e' + numDigits) + 'e-' + numDigits)
      // Append the size symbol to the value
      value += ' ' + symbol

      // Break out of the loop since we've found the highest possible unit.
      return false
    }
  })

  return value
})

/**
 * Formats document table of contents
 */
Handlebars.registerHelper('formatTOC', function(context, options) {
  var html = ''
    , docDetailsBaseUrl = '/#/page/docs/details?targetId='
    , tocHeader

  // Bail if no TOC content was supplied to the helper.
  if (!context) {return html}

  // Iterate through the TOC content and dynamically build it's HTML. The
  // result is intended to be injected into the TOC sidebar within the
  // documentation viewer.

  // First, process the top level header information. All other elements in the
  // context array are sub-items and should be nested under this.
  tocHeader = context.shift()
  html += '<header class="n-header">' +
            '<i class="n-close-icon"></i>' +
            '<a href="' + docDetailsBaseUrl + '=' + tocHeader.path + '">' +
              '<h3>' + tocHeader.title + '</h3>' +
            '</a>' +
          '</header>' +
          '<ul>'

  // Next, iterate through all sub-elements and build the TOC HTML accordingly.
  _.each(context, function(doc, index, _context) {
    // Check if we've reached the last document in the list. If so, there is no
    // next index we need to worry about so set it equal to the current index.
    var nextIndex = index + 1
    if (nextIndex === _context.length) {nextIndex = index}

    // Initialize the current and next level numbers within the context of this
    // iteration. The difference between this level and the following is used
    // to determine which items should be display as sub-doc headers.
    var currentLevel  = doc.level
      , nextLevel = _context[nextIndex].level

    // If the next level is greater than the level of this iteration, then we
    // should display this as a new sub-level header.
    if (nextLevel > currentLevel) {
      html += '<ul><li class="n-list-header">'
    // Otherwise, just create another list item on within this level.
    }else {
      html += '<li>'
    }

    // Complete the <li> element by adding in the doc link.
    html += '<a href="' + docDetailsBaseUrl + doc.path + '">' + doc.title +
            '</a></li>'

    // Iterate back through all the levels and close out the <ul> elements
    // that were generated for the sub-headers.
    var nextLevelDiff = currentLevel - nextLevel
    if (nextLevelDiff > 0) {
      for (var k = 0; k < nextLevelDiff; k++) {html += '</ul>'}
    }
  })

  // Finally, close out the <ul> from the TOC header.
  html += '</ul>'

  return html
})
