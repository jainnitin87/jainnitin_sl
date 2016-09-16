
App.Utils.SubViewHelper = Backbone.Model.extend({

  // Map of sub-view id to sub-view
  subViews: null,

  initialize: function() {
    VERBOSE('SubViewHelper initialize cid: ' + this.cid)
    this.subViews = {}
  },

  destroy: function() {
    VERBOSE('SubViewHelper destroy cid: ' + this.cid)
  },

  // Register a subview by id
  register: function(id, subView) {
    VERBOSE('SubViewHelper register id:' + id + ' cid: ' + this.cid)
    this.subViews[id] = subView
  },

  // Get subview by id
  get: function(id) {
    return this.subViews[id]
  },

  // Get IDs of all registered views
  getIds: function() {
    return _.keys(this.subViews)
  },

  render: function(id) {
    VERBOSE('SubViewHelper render id:' + id + ' cid:' + this.cid)
    var subView = this.get(id)
    if(subView.render) {
      subView.render()
    }
  },

  renderAll: function() {
    VERBOSE('SubViewHelper renderAll cid:' + this.cid)
    this.iterate('render')
  },

  // Iterate over all sub views, invoking a named function if it
  // is available in the subView. You can pass upto 5 arguments.
  // Currently, the max number of arguments in our app is around 5.
  iterate: function(functionName, param1, param2, param3, param4, param5) {
    VERBOSE('SubViewHelper iterate cid:' + this.cid +
            ' functionName:' + functionName)

    _.each(this.subViews, function(subView, id) {
      if(subView[functionName]) {
        // Can't use apply arguments because (1) the first argument, which
        // is the functionName, is not allowed to be passed. (2) Not all
        // browsers accept a generic type of array as argument. The
        // argument is a special kind of array.
        subView[functionName](param1, param2, param3, param4, param5)
      }
    })
  },

  // Remove all registered subviews
  removeAll: function() {
    VERBOSE('SubViewHelper removeAll cid:' + this.cid)
    this.iterate('destroy')
    this.subViews = {}
  },

  // Get sub view by id
  remove: function(id) {
    VERBOSE('SubViewHelper remove id:' + id + ' cid:' + this.cid)
    var subView = this.get(id)
    if ( subView.destroy ) {
      subView.destroy()
    }
    delete this.subViews[id]
  }
})
