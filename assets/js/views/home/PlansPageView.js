// PlanListPage

var accounts = {};

App.Views.Plans = App.Views.BasePageView.extend({

    /////////////////////////////////////////////////////////////////////////////
    // Properties

    // Page ID
    pageId: 'plans',

    // View template
    template: null,

    // Used to track the last time a user accessed this page view.
    lastAccessTime: null,

    model: null,

    initialized: false,

    events: {

    },

    crmId: null,

    userEmail: null,

    getParameterByName: function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    onSubmit: function(ev) {
        //var searchRoute
        //  , query = this.$('#main-search-box').val()
        //
        //// Block the navigation if input is blank
        //if (!query) {
        //  return
        //}

        // Otherwise, redirect the user to the advanced search page using the
        // query they've input.
        //searchRoute = {
        //  pageId: 'search',
        //  subPageId: 'list',
        //  options: '&stq=' + query
        //}

        App.NavigationManager.navigateToPageRouteObject(searchRoute)
    },



    /////////////////////////////////////////////////////////////////////////////
    // Functions (Core)

    initialize: function() {
        VERBOSE('PlansPage: Initializing...')
        // Call super first since it sets the pageId.
        App.Views.BasePageView.prototype.initialize.apply(this, arguments)

        // Initialize the view template
        this.template = App.Templates['plans/plans'];
        this.loadingTemplate = App.Templates['loading'];

        /* this.model = new App.Models.Page({id: this.pageId})

         this.listenTo(this.model, 'sync', this.onFetchComplete)*/


    },

    createSubscription: function(planId) {
        var self = this;
        var accountModel = new App.Models.AccountModel();
        var accountObj = {
            name: this.userEmail || this.crmId,
            subscription: {
                productRatePlanId: planId
            },

            currency: "USD",
            billToContact: {
                firstName: "Nitin",
                lastName: "Jain"
            },
            paymentTerm: "Net 30",
            crmId: this.crmId

        }
        accountModel.save(accountObj, {
            success: function(res, data) {
                if (data.success) {


                    accounts[data.accountId] = data;

                    //Backbone.history.navigate('https://52.53.149.186:9440/ssp/index.html', {
                    //    trigger: true
                    //});

                    location.href = "https://52.53.149.186:9440/ssp/index.html";
                } else {
                    Backbone.history.navigate('xi/errorSubscription', {
                        trigger: true
                    });
                }
            },
            error: function() {

            }
        });
    },

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Page)

    render: function() {
        this.crmId = App.session.user.get("accountId");
        this.userEmail = App.session.user.get("email");
        this.$el.html(this.loadingTemplate());


        this.checkAccount(this.redirectToBilling, this.showPlans);
        // Set the id
        this.$el.attr('id', this.pageId);

        // Initialize the subViewHelper
        this.subViewHelper = new App.Utils.SubViewHelper()

        // Compile the template and add it's HTML to the $el
        return this.$el
    },

    showPlans: function() {
        var plans = new App.Models.PlansModel();
        var self = this;
        plans.fetch({
            success: function(res, data) {
                if(data[0].id === "2c92c0f8564ed83a01566b2ed4f971d9"){
                    data[0].price = "$$"
                }            
                if(data[1].id === "2c92c0f8569c6bce0156a04478bc6778"){
                    data[1].price = "$1000"
                }
                if(data[2].id === "2c92c0f8569c6c230156a04247a96600"){
                    data[2].price = "$0"
                }
                var planData = {
                    "data": data
                };
                self.$el.html(self.template(planData));

                $('.card').click(function() {
                    self.createSubscription.call(self, $(this).data('id'));
                });
            }
        });
    },

    redirectToBilling: function(accountData) {
        Backbone.history.navigate('xi/billing?accountId=' + accountData[0].accountId, {
            trigger: true
        });
    },

    checkAccount: function(success, failure) {
        var accountModel = new App.Models.AccountModel();
        var self = this;
        accountModel.fetch({
            data: {
                crmid: self.crmId
            },
            success: function(res, accountData) {
                if (accountData.length < 1  || self.getParameterByName("q")) {
                    failure.call(self,accountData);
                } else {
                    success.call(self,accountData);
                }
            }
        });

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