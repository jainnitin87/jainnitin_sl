App.Views.BasePageView = App.Views.BaseView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties (IDs)

  // Page id
  pageId: null,

  // When there's no new subpage and currentSubPageId are identified,
  // this is used as the subpage value.
  defaultSubPageId: null,

  // The current selected sub page id
  currentSubPageId: null,

  // The current page option parameter string from the page route
  currentOptions: null,

  // Mapping used to declare all subpages within a view
  subpageMap: null,

  /////////////////////////////////////////////////////////////////////////////
  // Properties (Veiws)

  // View of  the current selected sub page view
  currentSubPageView: null,

  // Subview Helper
  subViewHelper: null,

  // Used to track the last time a user accessed this page view.
  lastAccessTime: null,

  showPageNav: false,

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function() {
    this.$el.addClass('n-page page-' + this.pageId)
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Page)

  // TODO: Figure out why views which inherit this class cannot properly call
  // this as it's super class.
  render: function() {
    // Set the id
    this.$el.attr('id', this.pageId)

    // Initialize the subViewHelper
    this.subViewHelper = new App.Utils.SubViewHelper()

    return this.$el
  },

  // Shows the page with animation and updates the content based on the
  // pageRoute which includes: "subPageId" and "options".
  show: function(pageRoute) {
    // Show the page nav if needed
    $('header > .page-nav')[(this.showPageNav) ? 'show' : 'hide']()

    // NOTE: If you want to add animation transition, do it here. Then
    // call this.showSubPage after the animation event is done.
    this.$el.show()

    // Start showing the subpage based on the route.
    this.showSubPage(pageRoute)
  },

  // Hides the page and stops all services of the page
  hide: function() {
    this.stopServices()
    this.$el.hide()
  },

  // Override me
  // Function to run right after the page is rendered in case we need to wait
  // for something to first be added to the DOM
  afterRender: function() {

  },

  showSubPage: function(pageRoute) {
    // (1) Visualization
    // -----------------

    var subPageId = pageRoute.subPageId
      , options = pageRoute.options

    VERBOSE('Showing subpage: ' + subPageId)
    // Make sure there is a subpage value and it's not undefined.
    subPageId = subPageId || this.defaultSubPageId

    // Update the selected subpage view by hiding first the current subpage
    var pm = this.$('.n-page-master')
    if (this.currentSubPageId !== subPageId && this.currentSubPageView) {
      $(pm).find('[subpage="' + this.currentSubPageId + '"]').hide()
    }

    // NOTE: If you want to add a transition, do it here.
    // Then show the newly selected subpage
    $(pm).find('[subpage="' + subPageId + '"]').show()

    // Replace the currentSubPageView
    this.currentSubPageView = $(pm).find('[subpage="' + subPageId + '"]')

    // (2) Page and Data releated purposes
    //------------------------------------

    // Update the body style based on the subPageId. We have to call this
    // first before starting the services because of rendering style timing
    this.updateBodyStyle(subPageId)

    // Show the subpage
    this.currentSubPageId = subPageId
    this.onShowSubPage(subPageId, options)

    // Determine which subView services need to start and stop based on the
    // selected subpage and options.
    this.startAndStopSubViewServices()

    // Now that the page is being shown, start services. When the page is
    // is hidden by calling this.hide(), stopServices is called.
    this.startServices()

    VERBOSE('BasePageView: pageId:' + this.pageId +
      ' subPageId: ' + this.currentSubPageId +
      ' options: ' + options)
  },

  // Returns the subpage component based on the passed subPageId. If
  // subPageId is undefined, it will return the current selected subpage.
  getSubPageElement: function(subPageId) {
    subPageId = subPageId || this.currentSubPageId
    var pm = this.$('.n-page-master')
    return $(pm).find('[subpage="' + subPageId + '"]')
  },

  setLastAccessTime: function(timestamp) {
    DEBUG('Setting last access time for page')
    this.lastAccessTime = timestamp
  },

  // Get the last access time.
  getLastAccessTime: function() {
    return this.lastAccessTime;
  },

  // Called when the subpage is updated to modify the body style. This
  //  updates the body style by removing the previous class names which are
  //  prefixed with either page-* or subview-*. All other class names which are
  //  added by the customized page are preserved.
  updateBodyStyle: function(subPageId) {
    var bodyClassReset = /\b(page|subview)-.+?\b/g
      , bodyClassName = $('body')[0].className.replace(bodyClassReset, '')
    $('body')
      .attr('class', bodyClassName)
      .addClass('page-' + this.pageId)
      .addClass('subview-' + subPageId)
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Event handlers)

  // @must-be-overridden
  // Called when a subpage is to be shown after all animation is done.
  onShowSubPage: function(subPageId, options) {
  },

  // @must-be-overridden
  // Called when the subpage gets hidden.
  onHideSubPage: function() {
  },

  // NOTE: To be overridden by subclass
  // Refreshes the view with new data. This is usually called when an
  // update/create action happens.
  refreshView: function() {
    // Call the iterate method of the subviewhelper to refresh the data for
    // all the available subviews.
    if(this.subViewHelper) {
      this.subViewHelper.iterate('refreshView')
    }
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Services)

  // Called when subpage or options is updated. This triggers to start
  // the services of the active subviews and stops the services of the
  // inactive subviews.
  startAndStopSubViewServices: function() {
    // Exit if there are no existing subviews to take care of.
    if (_.isEmpty(this.subViewHelper)) {return}
    if (_.isEmpty(this.subViewHelper.getIds())) {return}

    var activeSubviewId = this.currentSubPageId
    var inactiveSubviewIds = _.without(
      this.subViewHelper.getIds(),
      activeSubviewId)

    // First, start services on the currently active subview
    VERBOSE('BasePageView: pageId: ' + this.pageId +
      ' | starting services on subViewId: ' + activeSubviewId)
    this.subViewHelper.get(activeSubviewId).startServices()

    // Then iterate through the remaining subviews and stop their services.
    _.each(inactiveSubviewIds, function(subViewId) {

      VERBOSE('BasePageView: pageId: ' + this.pageId +
        ' | stopping services on subViewId: ' + subViewId)
      this.subViewHelper.get(subViewId).stopServices()

    }, this)

  },

  // @override
  // Handler when services are started on this page.
  // Also delegates the events of the subviews.
  onStartServices: function() {
    // Delegate events
    this.delegateEvents()
  },

  // @override
  // Handler when services are stopped on this page.
  // Also stops the services and undelegates the events of the subviews.
  onStopServices: function() {
    // Undelegate events
    this.undelegateEvents()

    // Exit if there are no existing subviews to take care of.
    if (_.isEmpty(this.subViewHelper)) {return}
    if (_.isEmpty(this.subViewHelper.getIds())) {return}

    // Otherwise, iterate through all of the subviews to stop their services as
    // well. Also, pass in the correct context.
    _.each(this.subViewHelper.getIds(), function(subViewId) {
      if (this.subViewHelper.get(subViewId)) {
        VERBOSE('BasePageView : pageUuid: ' + this.pageId +
          ' | stop services on subViewId: ' + subViewId);
        this.subViewHelper.get(subViewId).stopServices();
      }
    }, this)
  }

})
