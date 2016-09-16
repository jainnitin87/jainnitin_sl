
App.Views.BaseFormView = App.Views.BaseView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  formBtnSelector: 'button[type="submit"]',
  formFilled: false,
  previousBtnState: null,

  /////////////////////////////////////////////////////////////////////////////
  // Event Listeners

  events: {
    'click .n-auth-form-actions > span.n-nav-back': 'onClickBack',
    'click button[type="submit"]' : 'onFormSubmit',
    'keyup input': 'onFormKeypress'
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function initialize() {
    VERBOSE('BaseFormView: Initializing.')
    _.bindAll(this, 'onFormSubmit', 'onFormKeypress', 'onClickBack',
      'onFormSubmitSuccess', 'onFormSubmitError', 'validatePassword')

    // Attach custom parsely validators.
    window.ParsleyValidator
      .addValidator('phone', this.validatePhoneNumber, 32)
      .addValidator('twitterHandle', this.validateTwitterHandle, 32)
      .addValidator('password', this.validatePassword, 32)
      .addValidator('gatekeeperEmail', this.validateGatekeeperEmail, 32)
      .addMessage('en', 'phone', 'Invalid phone number. '+
        'A valid phone number can contain numbers, space and special '+
        'characters such as "- + ( )".')
      .addMessage('en', 'twitterHandle', 'Invalid twitter handle. ' +
        'A valid twitter handle can contain letters, numbers, underscore [_]' +
        ' and can be of maximum 15 characters in length.')
      .addMessage('en', 'password',
        'Password must meet all the criteria below:<br/>' +
        '* Minimum 6 characters<br/>' +
        '* At least 1 uppercase character<br/>' +
        '* At least 1 lowercase character<br/>' +
        '* At least 1 special character from $!@*#%&amp;<br/>')
  },

  render: function render(options) {
    this.$el.attr('id', this.pageId)
    this.$el.html(this.template())

    // If there is a button present in the form, it should always be disabled
    // by default.
    this.$el.find(this.formBtnSelector).addClass('disabled')
    this.$(this.formBtnSelector).attr('disabled', true)

    return this.el
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Validators)

  /**
   * Checks the validity of the email allowed by the gatekeeper app. This is
   * extra validation that we do on the email field once the base parsley
   * email validation is complete.
   *
   * An email is considered to ba valid for gatekeeper if it satisfies the
   * conditions below:
   * 1. It is a valid email address
   * 2. It does not contain the character '+'
   */
  validateGatekeeperEmail: function(value, requirement) {
    return !_.contains(value, '+')
  },

  /**
   * Checks the validity for Twitter Handle.
   *
   * A twitter handle is considered valid if it satisfies the conditions below:
   * 1. Maximun character length equal to 15
   * 2. Letters from a-z, A-Z
   * 3. Numbers between 0-9
   * 4. Special chanracter '_'
   */
  validateTwitterHandle: function(value, requirement) {
    return /^[a-zA-Z0-9_]{1,15}$/.test(value)
  },

  /**
   * Validate that the password has passed all criteria checks.
   *
   * This is a custom parsley validator that is used to ensure the password has
   * met all requirements. It depends on `data-parsley-password="true"` being
   * set as an attribute on the password input to be validated.
   *
   * @see http://parsleyjs.org/doc/#psly-validators-craft
   *
   * @param {String} value - Current value of the input field
   * @param {String} requirement - Current value of the custom attribute
   */
  validatePassword: function(value, requirements) {
    var pwStatus = this.ckPasswordCriteria(value)
    var allCriteriaPass = !_.contains(pwStatus, false)

    return (requirements && allCriteriaPass)
  },

  /**
   * Handle CSS class insertion to the message box.
   *
   * This function handles the addition of success or error CSS classes to the
   * message box above the form in the DOM.
   *
   * @see http://parsleyjs.org/doc/index.html#psly-events-usage
   *
   * @param {Object} field - Parsley field instance
   */
  validationHandler: function(field) {
    var msgBox = field.$element.parents().find('#msg-box')

    // Remove any error messages set by the 'showMsg' function.
    msgBox.children('span').remove()

    // Though field has been validated, field.validationResult is never
    // populated. Thus DOM needs to be checked to figure out if there is a
    // validation error.
    if (msgBox.find('ul > li').length !== 0) {
      msgBox.removeClass('alert-success success')
      msgBox.addClass('alert error')
    } else {
      msgBox.removeClass('alert error')
    }
  },

  validateForm: function() {
    var form = this.$('form').parsley({
      priorityEnabled: false,
      errorClass: 'error',
      successClass: 'success',
      errorsContainer: '#msg-box'
    })

    // The callback function is called post-validation of each field.
    form.subscribe('parsley:field:validated', this.validationHandler)

    return form.validate()
  },

  /**
   * Phone number can have numbers between 0-9,-,+,() and space only
   */
  validatePhoneNumber: function(value, requirements) {
    return /^[0-9-+()\s]*$/.test(value)
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Event Handlers)

  /**
   * Handle form submission.
   *
   * @abstract
   */
  onFormSubmit: function onFormSubmit(ev) {

  },

  /**
   * Check if the form has been fully filled.
   *
   * This method checks for form completion in order to show the submit button
   * when applicable. While the user is typing within an input field of the
   * form it checks to see if all inputs have a value. If so, the submit
   * button will be enabled.
   *
   * @param {Object} event
   */
  onFormKeypress: function onFormKeypress(ev) {
    var formState = _.map(this.$('input'), function(item) {
      // If the input field contains class 'optional', return 'true' since it
      // need not be filled.
      if (_.contains(item.classList, 'optional')) {
        return true
      }
      return !!this.$(item).val()
    }, this)
    var formFilled = !_.contains(formState, false)
    var action

    // Toggle the signup submit button based on the state of the form.
    action = (formFilled) ? 'removeClass' : 'addClass'
    this.$(this.formBtnSelector)[action]('disabled')
    this.$(this.formBtnSelector).attr('disabled', !formFilled)
    this.trigger('form:fill', formFilled)

    // Export the form status to the view scope in case any other methods need
    // access to this state.
    this.formFilled = formFilled
  },

  /**
   * Handle `back` button on form navigation.
   *
   * @abstract
   */
  onClickBack: function onClickBack(ev) {

  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Event Handlers - Ajax Responses)

  /**
   * Handle success response from request.
   *
   * @param {Object} Backbone model
   * @param {Object} response
   */
  onFormSubmitSuccess: function onFormSubmitSuccess(model, res) {
    this.showMsg(res.status)
  },

  /**
   * Handle error response from request.
   *
   * @param {Object} Backbone model
   * @param {Object} error
   */
  onFormSubmitError: function onFormSubmitError(model, err) {
    // TODO: We may want to have a smarter form reset. It can be kind of
    // irritating to run into an error on form submission and lose all of the
    // data you have entered.
    this.render()
    this.showMsg(err.responseJSON.error, 'error')
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Util)

  /**
   * Run a password through a series of criteria checks.
   *
   * @param {String} value
   * @return {Object} pwCriteriaResults - Boolean mapping of criteria results
   */
  ckPasswordCriteria: function(value) {
    var pwCriteria = {
      minLength: /^.{6,}$/,
      uppercase: /[A-Z]{1}/,
      lowercase: /[a-z]{1}/,
      special: /[!@#$%&*]{1}/
    }
    var pwCriteriaResults = {}

    _.each(pwCriteria, function(regex, criteriaId) {
      pwCriteriaResults[criteriaId] = !!value.match(regex)
    }, this)

    return pwCriteriaResults
  },

  /**
   * Populate the form message container with an alert.
   *
   * @param {string} msg - Alert text to display
   * @type {string} [type=success] - Alert type
   */
  showMsg: function showMsg(msg, type) {
    var msgBox = this.$('#msg-box')
    var typeIdMap = {
      info: 'alert-info',
      success: 'alert-success',
      warning: 'alert-warning',
      error: 'alert-error'
    }
    type = type || 'success'

    // Clear any previous alert messages
    msgBox.removeClass(function(idx, css) {
      return (css.match(/alert(-.+)*/g) || []).join(' ')
    })

    msgBox.addClass('alert')
    msgBox.addClass(typeIdMap[type])
    msgBox.html('<span>' + msg + '</span>')
  },

  /**
   * Parse all input fields into an Object
   *
   * @param {string} selector - JQuery selector for the form
   * @return {Object}
   */
  parseFormValues: function parseFormValues(selector) {
    var valueMap = {}
    var _selector = selector || 'input'
    this.$(_selector).each(function(idx, item) {
      valueMap[item.getAttribute('name')] = item.value.trim()
    })

    // If email is available, convert it to all lowercase for consistency.
    if (valueMap.hasOwnProperty('email')) {
      valueMap.email = valueMap.email.toLowerCase()
    }

    return valueMap
  },

  /**
   * Set the current state of the form.
   *
   * @param {string} state
   */
  setFormState: function setFormState(state) {
    var _this = this
    var btn = this.$(this.formBtnSelector)
    var actionMap = {
      waiting: _setWaitingState,
      done: _setDoneState
    }

    // Lock the form
    btn.blur()
    btn.removeClass(function(idx, css) {
      return (css.match(/btn-(primary|success)/g) || []).join(' ')
    })
    actionMap[state]()

    // Action handlers
    function _setWaitingState() {
      _this.setAttr('input', 'disabled', true)
      btn.attr('disabled', true)
      btn.addClass('btn-primary disabled')
      // TODO: Replace this with spinner
      btn.html('Submitting...')
    }
    function _setDoneState() {
      _this.setAttr('input', 'disabled', true)
      btn.attr('disabled', true)
      btn.addClass('btn-success disabled')
      btn.html('Success!')
    }
  },

  setAttr: function(selector, attr, val) {
    _.each(this.$(selector), function(item) {
      this.$(item).attr(attr, val)
    }, this)
  }
})
