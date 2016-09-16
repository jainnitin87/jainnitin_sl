
App.PopupManager = {

  /**
   * Render the popup within the DOM
   */
  renderPopupView: function(PopupViewClass, options) {
    var popupId = PopupViewClass.prototype.el
    var popupView = new PopupViewClass({
      el: this.createPopupContainer(popupId.replace('#', '')),
    })

    popupView.show()
  },

  /**
   * Show the popup
   */
  showPopup: function(actionTarget, options) {
    // Ensure that a popup view exists for the requested target.
    if (!App.Views.Popups.hasOwnProperty(actionTarget)) {
      throw new Error('PopupManager: Issue navigating to popup ' +
          actionTarget)
    }
    this.renderPopupView(App.Views.Popups[actionTarget])
  },

  /////////////////////////////////////////////////////////////////////////////
  // Util

  /**
   * Dynamically create a container for a popup.
   *
   *
   */
  createPopupContainer: function(containerId) {
    // Clean up
    $('#globalModalContainer #' + containerId).remove()
    // Create container
    var tmpl = App.Templates['basecomponents/popups/BasePopupView']
    var popupDiv = $(tmpl({id: containerId}))
    popupDiv.appendTo('#globalModalContainer')

    return popupDiv
  }
}
