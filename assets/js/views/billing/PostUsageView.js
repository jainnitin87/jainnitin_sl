// Homepage
App.Views.PostUsageView = App.Views.BasePageView.extend({

    /////////////////////////////////////////////////////////////////////////////
    // Properties

    // Page ID
    pageId: 'usage',

    accountId: null,

    // View template
    template: null,

    // Used to track the last time a user accessed this page view.
    lastAccessTime: null,

    model: null,

    initialized: false,

    events: {

    },

    currentDate: null,

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
        VERBOSE('Post Usage View: Initializing...')
        // Call super first since it sets the pageId.
        App.Views.BasePageView.prototype.initialize.apply(this, arguments)

        // Initialize the view template
        this.template = App.Templates['usage/postUsage'];



    },


    render: function() {
        this.$el.attr('id', this.pageId);
        this.subViewHelper = new App.Utils.SubViewHelper();
        this.accountId = this.getParameterByName("accountId");
        this.currentDate = (new Date());
        this.currentDate = (this.currentDate.getMonth() + 1) + "/" + this.currentDate.getDate() + "/" + (1900 + this.currentDate.getYear());

        


        //if (this.accountId && accounts[this.accountId]) {
        //    accountInfo.accountId = accounts[this.accountId].accountNumber || "";
        //    accountInfo.subId = accounts[this.accountId].subscriptionNumber || "";
//
        //} else 
        if(this.accountId){
            this.checkAccount(this.accountSuccess,this.accountFailure);
        } else{
            this.accountFailure();
        }

        

        return this.$el
    },

    accountSuccess: function(accInfo){
        var accountInfo = {
            accountId: accInfo[0].accountNumber,
            subId: accInfo[0].subscriptionNumber,
            usageDate: this.currentDate
        };

        this.$el.html(this.template({
            accountInfo: accountInfo
        }));
        this.afterRender();
    },

    accountFailure: function(){
        var accountInfo = {
            accountId: "A00000169",
            subId: "A-S00000149",
            usageDate: this.currentDate
        };

        this.$el.html(this.template({
            accountInfo: accountInfo
        }));
        this.afterRender();
    },

    checkAccount: function(success, failure) {
        var accountModel = new App.Models.AccountModel();
        var self = this;
        accountModel.fetch({
            data: {
                //crmid: "SF100001"
                accountId: self.accountId
            },
            success: function(res, accountData) {
                if (accountData.length < 1) {
                    failure.call(self, accountData);
                } else {
                    success.call(self, accountData);
                }
            }
        });

    },

    afterRender: function() {
        var self = this;
        // .promise().done(function() {
        $('.postUsageButton').click(function() {
            var accountId = $("#accountId").val();
            var subscriptionId = $("#SubscriptionId").val();
            var cpuUsage = $("#cpuUsage").val();
            var gbUsage = $("#gbUsage").val();
            var vmUsage = $("#vmUsage").val();
            var usageDate = $("#usageDate").val();
            var gbTransferred = $("#gbTransferred").val();
            var usage = {
                accountId: accountId,
                subscriptionId: subscriptionId,
                usage: [{
                    uom: "Per GHz",
                    qty: cpuUsage
                }, {
                    uom: "GB",
                    qty: gbUsage
                }, {
                    uom: "VMs per Month",
                    qty: vmUsage
                }, {
                    uom: "GB Transferred",
                    qty: gbTransferred
                }],
                usageDate: usageDate

            };
            self.postUsage.call(self, usage);
        });
        //  });
    },

    postUsage: function(usage) {

        $("#postStatus").text("");
        var self = this;
        var usageModel = new App.Models.UsageModel();
        usageModel.save(usage, {
            success: function(res, data) {
                console.log(data);
                $("#postStatus").html("Usage posted successfully!<p><a href='#/xi/billing?accountId=" + self.accountId + "'>Go to Billings</a></p>");
            },
            error: function(err) {
                /* body... */
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