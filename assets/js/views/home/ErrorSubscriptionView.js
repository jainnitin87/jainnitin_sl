// PlanListPage
App.Views.ErrorSubscription = App.Views.BasePageView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // Page ID
  pageId: 'errorSubscription',

  // View template
  template: null,

  // Used to track the last time a user accessed this page view.
  lastAccessTime: null,

  model: null,

  initialized: false,

  events: {
    
  },

  onSubmit: function(ev) {
    App.NavigationManager.navigateToPageRouteObject(searchRoute)
  },


  initialize: function() {
    VERBOSE('PlansPage: Initializing...')
    // Call super first since it sets the pageId.
    App.Views.BasePageView.prototype.initialize.apply(this, arguments)

    // Initialize the view template
    this.template = App.Templates['subscription/error'];
  },


  render: function() {
    var plans = new App.Models.PlansModel();
    var self = this;
     self.$el.html(self.template({}));
    // Set the id
    this.$el.attr('id', this.pageId);

    // Initialize the subViewHelper
    this.subViewHelper = new App.Utils.SubViewHelper()

    // Compile the template and add it's HTML to the $el
    return this.$el
  },

 
  // @override
  show: function(pageRoute) {
   
    // Call super to execute base show functionality
    App.Views.BasePageView.prototype.show.apply(this, [pageRoute])
  },

  // @override
  hide: function(pageRoute) {
   

    // Call super to execute base hide functionality
    App.Views.BasePageView.prototype.hide.apply(this, [pageRoute])
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Events)
  onFetchComplete: function() {
    this.initialized = true
    this.render()
    // TODO: Investigate this hero resize a bit more. Adding this appears to
    // fix things but there's probably a race condition here.
    this.afterRender()
  }

 
})
