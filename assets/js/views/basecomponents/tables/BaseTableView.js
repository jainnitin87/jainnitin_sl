App.Views.BaseTableView = App.Views.BasePageView.extend({

  /////////////////////////////////////////////////////////////////////////////
  // DOM Events

  events: {
    'click #dt-search-icon, .dt-search-clear'  : 'toggleDTSearch',
    'keyup .dt-searchbox'                      : 'onSearchKeyUp',
    'click  .btnPrevious'                      : 'goToPreviousPage',
    'click  .btnNext'                          : 'goToNextPage'
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Core)

  initializeDatatable: function(viewDom, selector, options) {
    var table = viewDom.find(selector)
    var dataTableRedraw = _.bind(this.onDatatableRedraw, this)
    _.extend(options, {fnDrawCallback: dataTableRedraw})
    return table.nutanixDatatable(options)
  },

  /////////////////////////////////////////////////////////////////////////////
  // Functions (Event Handlers)

  onDatatableRedraw: function(oSettings) {
    var start         = oSettings._iDisplayStart + 1,
        end           = oSettings.fnDisplayEnd(),
        total         = oSettings.fnRecordsTotal(),
        filteredTotal = oSettings.fnRecordsDisplay(),
        currentPage   = (oSettings._iDisplayLength === -1 ?
                        0 : Math.ceil( oSettings._iDisplayStart /
                          oSettings._iDisplayLength )) + 1,
        totalPages    = oSettings._iDisplayLength === -1 ?
                        0 : Math.ceil(oSettings.fnRecordsDisplay() /
                          oSettings._iDisplayLength)

    var paginationInfo = start + ' - ' + end + ' of ' + filteredTotal

    if (filteredTotal < total) {
      // Show that the total on the table is filtered.
      paginationInfo += ' (filtered from ' + total + ')'
    }

    // Update the page info
    this.$('.n-page-info').html(paginationInfo)

    // Determine if previous button should be enabled or not
    this.$('.btnPrevious').removeClass('n-disabled')
    if (totalPages <= 1 || currentPage === 1) {
      this.$('.btnPrevious').addClass('n-disabled')
    }

    // Determine if next button should be enabled or not
    this.$('.btnNext').removeClass('n-disabled')
    if (totalPages <= 1 || currentPage === totalPages) {
      this.$('.btnNext').addClass('n-disabled')
    }
  },

  // Functions (Datatable search)
  //----------------------

  toggleDTSearch: function() {
    var _this = this
    if(_this.$('.dt-search').hasClass('n-active')) {
      _this.$('.dt-search').removeClass('n-active')
      // Clear the search string
      _this.$('.dt-searchbox').val('')
      // Redraw the datatable
      _this.table.search('').draw()
    } else {
      _this.$('.dt-search').addClass('n-active')
      _this.$('.dt-searchbox').focus()
    }
  },

  onSearchKeyUp: function(ev) {
    // Filter the dataTable based on the value entered in the search text
    // input.
    var _this = this
    var searchString = ev.target.value
    _this.table.search(searchString).draw()
  },

  // Functions (Paginator)
  //----------------------
  // Manually override DataTable's paging mechanism to customize the
  // style and content.

  // Show previous page
  goToPreviousPage: function() {
    var _this = this
    _this.table.page('previous').draw(false)
  },

  // Show next page
  goToNextPage: function() {
    var _this = this
    _this.table.page('next').draw(false)
  },

})
