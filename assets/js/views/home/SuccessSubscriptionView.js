// PlanListPage
App.Views.SuccessSubscription = App.Views.BasePageView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // Page ID
  pageId: 'successSubscription',

  // View template
  template: null,

  // Used to track the last time a user accessed this page view.
  lastAccessTime: null,

  model: null,

  initialized: false,

  events: {
    
  },

  getParameterByName : function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  onSubmit: function(ev) {
    App.NavigationManager.navigateToPageRouteObject(searchRoute)
  },


  initialize: function() {
    VERBOSE('PlansPage: Initializing...')
    // Call super first since it sets the pageId.
    App.Views.BasePageView.prototype.initialize.apply(this, arguments);


    // Initialize the view template
    this.template = App.Templates['subscription/success'];
  },


  render: function() {
    var plans = new App.Models.PlansModel();
    var self = this;
    var accountId = this.getParameterByName("accountId");
     self.$el.html(self.template({accountInfo:accounts[accountId]}));
    // Set the id
    this.$el.attr('id', this.pageId);

    // Initialize the subViewHelper
    this.subViewHelper = new App.Utils.SubViewHelper();

    // Compile the template and add it's HTML to the $el
    return this.$el;
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
