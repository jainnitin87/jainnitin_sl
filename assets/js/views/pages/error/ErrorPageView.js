App.Views.ErrorPage = App.Views.BasePageView.extend({
  /////////////////////////////////////////////////////////////////////////////
  // Properties

  // @inherited
  pageId: 'error',

  // View template
  template: null,

  // Error mapping
  errorMap: {
    403: null,
    404: null,
    500: null,
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initialize: function() {
    VERBOSE('StaticPageView: Initializing...')

    // Call super first since it sets the pageId.
    App.Views.BasePageView.prototype.initialize.apply(this, arguments)

    // Set the default template to 404 - Page not found.
    this.template = App.Templates['pages/static/Error404View.hbs']

    // Initialize the view template
    this.errorMap[403] = App.Templates['pages/static/Error403View']
    this.errorMap[404] = App.Templates['pages/static/Error404View']
    this.errorMap[500] = App.Templates['pages/static/Error500View']
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Page)

  render: function(options) {
    // Set the id
    this.$el.attr('id', this.pageId)

    // Initialize the subViewHelper
    this.subViewHelper = new App.Utils.SubViewHelper()

    // Compile the template and add it's HTML to the $el
    this.$el.html(this.template)

    return this.$el
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Event handlers)

  // @override
  // Function that handles subpage and data related actions. This is called
  // after all the page render animation is done.
  onShowSubPage: function(subPageId, options) {
    // Assign the appropriate template based on the subPageId.
    this.template = this.errorMap[subPageId]
    this.render()
  }
})
