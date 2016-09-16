// Homepage
App.Views.Billing = App.Views.BasePageView.extend({

    /////////////////////////////////////////////////////////////////////////////
    // Properties

    // Page ID
    pageId: 'billing',

    // View template
    template: null,

    // Used to track the last time a user accessed this page view.
    lastAccessTime: null,

    model: null,

    initialized: false,

    events: {

    },

    onSubmit: function(ev) {
        var searchRoute, query = this.$('#main-search-box').val()

        // Block the navigation if input is blank
        if (!query) {
            return
        }

        // Otherwise, redirect the user to the advanced search page using the
        // query they've input.
        searchRoute = {
            pageId: 'search',
            subPageId: 'list',
            options: '&stq=' + query
        }

        App.NavigationManager.navigateToPageRouteObject(searchRoute)
    },



    /////////////////////////////////////////////////////////////////////////////
    // Functions (Core)

    initialize: function() {
        VERBOSE('HomeView: Initializing...')
        // Call super first since it sets the pageId.
        App.Views.BasePageView.prototype.initialize.apply(this, arguments)

        // Initialize the view template
        this.template = App.Templates['billing/billingPreview'];
        this.loadingTemplate = App.Templates['loading'];

        /* this.model = new App.Models.Page({id: this.pageId})

    this.listenTo(this.model, 'sync', this.onFetchComplete)*/


    },

    getParameterByName: function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Page)

    render: function() {
        this.$el.html(this.loadingTemplate());
        var self = this;
        var accountId = this.getParameterByName("accountId");
        var currentBillingStartDate = new Date();
        var currentBillingEndDate = new Date();
        // Set the id
        this.$el.attr('id', this.pageId)

        // Initialize the subViewHelper
        this.subViewHelper = new App.Utils.SubViewHelper();

        var invoiceModel = new App.Models.InvoiceModel();
        invoiceModel.fetch({
            data: {
                accountId: accountId
            },
            success: function(res, data) {
                if (data && data.success != false && data.invoices.length > 0) {
                    currentBillingStartDate = new Date(data.invoices[0].invoiceDate);
                } else {
                    var days = 10;
                    currentBillingStartDate = new Date(currentBillingStartDate.getTime() - (days * 24 * 60 * 60 * 1000));
                }


                self.$el.html(self.template(data));
                self.renderBillingGraph(accountId, currentBillingStartDate, currentBillingEndDate);

            }
        });





        // Compile the template and add it's HTML to the $el



        return this.$el
    },

    renderBillingGraph: function(accountId, currentBillingStartDate, currentBillingEndDate) {
        var self = this;
        var billPreviewModel = new App.Models.BillPreviewModel();
        var currentDate = new Date();
        currentDate = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + (1900 + currentDate.getYear());
        billPreviewModel.save({
            "AccountId": accountId,
            "TargetDate": moment().add(31, "days").format('YYYY-MM-DD')
        }, {
            success: function(res, data) {
                var usageArray = [];
                if (data.results && data.results.length > 0 && data.results[0].InvoiceItem && data.results[0].InvoiceItem.length > 0) {
                    var totalAmount = 0;
                    for (var i = data.results[0].InvoiceItem.length - 1; i >= 0; i--) {
                        var arr = [];
                        if(data.results[0].InvoiceItem[i].UOM === 'GB' && data.results[0].InvoiceItem[i].ChargeAmount == "0.15"){
                            continue;
                        }
                        //uom.push(data.results[0].InvoiceItem[i].UOM);

                        arr.push(data.results[0].InvoiceItem[i].UOM);
                        var amt = data.results[0].InvoiceItem[i].ChargeAmount;
                        //var amt = Math.random() * 1000;
                        totalAmount += parseFloat(amt);
                        arr.push(amt);
                        usageArray.push(arr);
                    }

                    $('#totalAmount').text("$" + totalAmount.toFixed(2));

                    setTimeout(function() {
                        console.log('usageArray >>> ', data.results[0].InvoiceItem);
                        var map = {
                            'Per GHz': {
                                name: 'CPU',
                                unit: 'GHz'
                            },
                            'VMs per Month': {
                                name: 'Number of replicated VMs',
                                unit: 'VMs'
                            },
                            'GB': {
                                name: 'VM disk size',
                                unit: 'GB'
                            },
                            'GB Transferred': {
                                name: 'Data transfer Out - Region 1',
                                unit: 'GB'
                            }
                        };

                        var usage = data.results[0].InvoiceItem,
                            obj, html = '',
                            item, unit;

                        html += '<div class="divTableBody">';
                        html += '<div class="billingperiod">';
                        html += 'Usage for billing period: ';
                        html += usage[0].ServiceStartDate.substring(0, 10);
                        html += ' - ' + usage[0].ServiceEndDate.substring(0, 10);
                        html += '</div>';

                        html += '   <div class="divTableRow">';
                        html += '       <div class="divTableHeading">Item</div>';
                        html += '       <div class="divTableHeading">Quantity</div>';
                        html += '       <div class="divTableHeading">Charge</div>';
                        html += '       <div class="divTableHeading">Charge Date</div>';
                        html += '   </div>';

                        for (var i = 0; i < usage.length; i++) {
                            obj = usage[i];
                            item = map[obj.UOM].name;
                            unit = map[obj.UOM].unit;

                            html += ' <div class="divTableRow">';
                            html += '     <div class="divTableCell">' + item + '</div>';
                            html += '     <div class="divTableCell">' + obj.Quantity + ' ' + unit + '</div>';
                            html += '     <div class="divTableCell">$' + obj.ChargeAmount + '</div>';
                            html += '     <div class="divTableCell">' + obj.ChargeDate.substring(0, 10) + '</div>';
                            html += ' </div>';
                        }
                        html += '</div>';
                        $('#usagedata').html(html);
                        console.log('usageArray2 >>> ' + usageArray);

                        var pie = c3.generate({
                            bindto: '#usageData1',
                            data: {
                                // iris data from R
                                columns: usageArray,
                                type: 'pie',
                                onclick: function(d, i) {
                                    //console.log("onclick", d, i);
                                },
                                onmouseover: function(d, i) {
                                    //console.log("onmouseover", d, i);
                                },
                                onmouseout: function(d, i) {
                                    //console.log("onmouseout", d, i);
                                }
                            }
                        });




                        var billingData = self.getDummyGraphData(currentBillingStartDate, currentBillingEndDate, totalAmount);

                        var chart = c3.generate({
                            bindto: '#chart',
                            data: {
                                x: 'x',
                                columns: billingData
                            },
                            axis: {
                                x: {
                                    type: 'timeseries'
                                }
                            }
                        });

                    }, 1);
                }

            }
        });
    },
    generateTable: function(data, map) {

    },
    getDummyGraphData: function(currentBillingStartDate, currentBillingEndDate, totalAmount) {

        function getDates(startDate, stopDate) {
            var dateArray = [];
            var currentDate = moment(startDate);
            while (currentDate <= stopDate) {
                dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
                currentDate = moment(currentDate).add(1, 'days');
            }
            return dateArray;
        }

        function getRandomSorted(n, min, max) {
            var results = [];
            for (i = 1; i <= n; i++) {
                var value = Math.floor(Math.random() * max + min);
                results.push(value);
            }
            results.push(max);
            return results.sort(function(a, b) {
                return a - b;
            });
        }

        var dummyData = [];
        var dateArray = getDates(currentBillingStartDate, currentBillingEndDate);
        var amtArr = getRandomSorted(dateArray.length, 0, totalAmount.toFixed(2));
        dateArray.unshift("x");
        amtArr.unshift("amount");
        dummyData.push(dateArray);

        dummyData.push(amtArr);
        return dummyData;
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