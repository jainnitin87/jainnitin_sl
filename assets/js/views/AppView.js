//
// Copyright (c) 2014 Nutanix Inc. All rights reserved.
//

App.Views.App = App.Views.BaseView.extend({
    /////////////////////////////////////////////////////////////////////////////
    // Constants

    // Maximum number of pages that will be kept in the DOM.
    MAX_PAGE_LIMIT: 6,

    /////////////////////////////////////////////////////////////////////////////
    // Properties

    // The main app model
    appModel: null,

    // @inherited
    // Represents the actual DOM element that corresponds to the HTML body
    el: 'body',

    // Represents the actual DOM element of the body of content
    elContent: '#page-wrapper',

    // Represents the actual DOM element of the page container
    elPage: '#page-content',

    // Contains the app navigation, Nutanix logo, search, and
    // user-info (profile, change password, help, logout)
    headerView: null,

    // Contains the site map and Nutanix contact info
    footerView: null,

    // Flag to identify if the currentPage needs to refresh if the previous
    // page was the login screen.
    isLoginPrevious: false,

    // Used to track if the app has been fully initialized. This state of this
    // property is checked throughout the AppView to determine whether or not
    // processing should continue. The reason we need this is to prevent issues
    // caused by the race condition between `AppView.renderInit` and when the URL
    // fragment is processed by the AppRouter.
    isInitialized: false,

    // Boolean that tells whether or not the view has been rendered
    isViewRendered: false,

    // The AppView's current page ID. This is not maintained in the AppModel
    // because this is dedicated to the view's internal process.
    currentPageId: null,

    publicViews: ['signup', 'resetPassword'],

    // Used to track what is the currently active public view in order to destroy
    // all non-active public views to prevent the zombie event firings
    activePublicView: null,

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Core)

    initialize: function() {
        DEBUG('AppView : Initializing')

        // Initialize the AppModel
        this.appModel = this.initializeAppModel()

        // TODO: Migrate all form views to utilize the `activeFormViews` subview
        // helper instead of the `activePublicView` property.
        //
        // Initialize all subViewHelpers. We'll maintain a separate helper for all
        // of the public form views so they can be handled separately.
        this.subViewHelper = new App.Utils.SubViewHelper()
        this.activeFormViews = new App.Utils.SubViewHelper()

        // Listen for all route changes
        this.appModel.on('change.route', this.onChangePageRoute, this)
    },

    // Instantiate and return the AppModel
    initializeAppModel: function(options) {
        DEBUG('AppView : Intializing AppModel')

        return new App.Models.App(options)
    },

    // Instantiate and return the LoginView
    initializeLoginView: function(options) {
        return new App.Views.Login(options)
    },

    // Instantiate and return the RegistrationView
    initializeSignupView: function(options) {
        return new App.Views.Signup(options)
    },

    // Instantiate and return the ResetPassword View
    initializeResetPasswordView: function(options) {
        return new App.Views.ResetPassword(options)
    },

    // Instantiate and return the ResetPassword View
    initializeResetPasswordConfirmView: function(options) {
        return new App.Views.ResetPasswordConfirm(options)
    },

    initializeVerifyUserView: function(options) {
        return new App.Views.VerifyUser(options)
    },

    // Instantiate and return the public generic error view
    initializeErrorView: function(options) {
        return new App.Views.Error(options)
    },

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Render)

    renderInit: function(pageRoute) {
        pageRoute = pageRoute || {}
        DEBUG('AppView : Initializing')
        var _this = this

        App.session.checkAuth({
            success: function() {
                _this.isInitialized = true
                _this.render()
                VERBOSE('CheckAuth successful')

                // Since all public form view render functions will block if the app
                // has not yet been initialized we need to check if the current page
                // route is one of the public form views. If it is, then navigate the
                // user back to this view so the route will fire again. Otherwise, show
                // the page as normal.
                var action = (_this.isPublicRoute(pageRoute)) ?
                    App.NavigationManager.navigateToRouteObject :
                    _this.showPage

                action.call(_this, pageRoute)
            },

            // Failure callback: No active login session
            error: function() {
                var action
                _this.isInitialized = true
                VERBOSE('CheckAuth failed' + _this.isInitialized)

                // Setup the action. If the an unauthenticated user is authorized to
                // view the requested page route then send them there. Otherwise,
                // redirect them to the login page.
                action = (_this.isPublicRoute(pageRoute)) ?
                    App.NavigationManager.navigateToRouteObject :
                    _this.redirectToLogin

                action.call(_this, pageRoute)
            }
        })
    },

    render: function() {
        DEBUG('Rendering main application')

        // Setup the application
        this.template = App.Templates['pages/AppView']
        this.$el.find(this.elContent).html(this.template())
        this.headerView = new App.Views.Header()
        this.isViewRendered = true
    },

    renderLogin: function(forwardRoute, options) {
        var _this = this
        var params = AppUtil.parseQueryToObject(options) || {}
        var loginView = this.activeFormViews.get('loginPageView')
        var pageId
        if (!loginView) {
            loginView = this.initializeLoginView()
            this.activeFormViews.register('loginPageView', loginView)
        }

        // Run login pre-checks
        //---------------------
        // Do nothing if there is already an active login session or the app has
        // not been fully initialized yet.
        if (!this.isInitialized) {
            return
        }
        if (App.session.isLoggedIn()) {
            return
        }
        // Ensure particle background is present
        //this.showParticleBackground()

        // Setup the login form
        // --------------------
        // 1. Ensure the current form view is the only one active in the DOM.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }

        // 2. Set all forward routes and options. We will only forward users to
        //    valid internal pages after a successful login.
        pageId = (forwardRoute) ? forwardRoute.pageId : ''
        forwardRoute = (_.contains(this.publicViews, pageId)) ? null : forwardRoute
        if (forwardRoute) {
            loginView.setForwardRoute(forwardRoute)
        }
        if (options) {
            loginView.setOptions(options)
        }

        // 3. Render the login form
        loginView.setCommonauthUrl()
            .then(function _renderLogin() {
                _this.$('#globalFormContainer').append(loginView.render()).show()

                // Show an error message if the previous login had failed.
                var authFailure =
                    (params.authFailure === 'true' && !params.failedUsername)
                var idpAuthFailure =
                    (authFailure && params.authFailureMsg === 'login.fail.message')
                var idpAuthFailureUnknown =
                    (authFailure && params.authFailureMsg !== 'login.fail.message')
                var idpAccountLocked = (!!params.failedUsername)

                if (idpAuthFailure) {
                    _this.$('#msg-box')
                        .addClass('alert alert-error')
                        .html('Login failed. Invalid username or password.<br/>' +
                            'Note: All existing users must perform a ' +
                            '<a href="/#/resetPassword" class="alert-link">password reset' +
                            '</a> before logging in for the first time.')
                } else if (idpAccountLocked) {
                    _this.$('#msg-box')
                        .addClass('alert alert-error')
                        .html('Account has not been verified. Please check your email ' +
                            'for instructions on completing the verification process. If ' +
                            'you did not receive this email, please reach out to us at' +
                            '<br /><a class="alert-link" ' +
                            'href="mailto:portal-accounts@nutanix.com?' +
                            'Subject=[My Nutanix] Requesting Account Help">' +
                            'portal-accounts@nutanix.com</a>.')
                } else if (idpAuthFailureUnknown) {
                    _this.$('#msg-box')
                        .addClass('alert alert-error')
                        .html('We&#39;re sorry! An unexpected error occured during ' +
                            'authentication. Please reach out to us at ' +
                            '<a class="alert-link" ' +
                            'href="mailto:portal-accounts@nutanix.com?' +
                            'Subject=[My Nutanix] Requesting Account Help">' +
                            'portal-accounts@nutanix.com</a> ' +
                            ' so we can help you resolve this issue.')
                }

            })
            .fail(function _renderLoginFailed() {
                ERROR('Failed to fetch commonauth url')
                // Render the login form as disabled and indicate to the user that an
                // error has ocurred.
                _this.$('#globalFormContainer').append(loginView.render()).show()
                loginView.setAttr('input', 'disabled', true)
                _this.$('#msg-box')
                    .addClass('alert alert-error')
                    .html('An error occurred while fetching details for the ' +
                        'authentication server which will cause login to fail. Please ' +
                        'refresh the page and try again.')
            })
            .done()
    },

    renderSignup: function(pageRoute) {
        // Do nothing if there is already an active login session or the app has
        // not been fully initialized yet.
        if (!this.isInitialized) {
            return
        }
        if (App.session.isLoggedIn()) {
            return this.redirectToEntity(pageRoute)
        }

        // Destroy any outstanding public views before rendering a new one.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }
        this.activeFormViews.removeAll()

        // Initialize the signup view.
        //this.showParticleBackground()
        var signupView = this.initializeSignupView()
        signupView.parseOptions(pageRoute.options)
        this.$('#globalFormContainer').append(signupView.render()).show()

        // Reset the currently active public view
        this.activePublicView = signupView
    },

    renderResetPassword: function(pageRoute) {
        // Do nothing if there is already an active login session or the app has
        // not been fully initialized yet.
        if (!this.isInitialized) {
            return
        }
        if (App.session.isLoggedIn()) {
            return
        }

        // Destroy any outstanding public views before rendering a new one.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }
        this.activeFormViews.removeAll()

        // Initialize the signup view.
        //this.showParticleBackground()
        var resetPasswordView = this.initializeResetPasswordView()
        this.$('#globalFormContainer').append(resetPasswordView.render()).show()

        // Reset the currently active public view
        this.activePublicView = resetPasswordView
    },

    renderResetPasswordConfirm: function(pageRoute) {
        // Destroy any outstanding public views before rendering a new one.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }
        this.activeFormViews.removeAll()

        // Initialize the signup view.
        this.showParticleBackground()
        var resetPasswordConfirmView = this.initializeResetPasswordConfirmView()
        resetPasswordConfirmView.parseOptions(pageRoute.options)
        this.$('#globalFormContainer')
            .append(resetPasswordConfirmView.render())
            .show()

        // Reset the currently active public view
        this.activePublicView = resetPasswordConfirmView
    },

    renderVerifyUser: function(pageRoute) {
        // Destroy any outstanding public views before rendering a new one.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }
        this.activeFormViews.removeAll()

        // Initialize the verify user view.
        this.showParticleBackground()
        var verifyUserView = this.initializeVerifyUserView()
        verifyUserView.parseOptions(pageRoute.options)

        this.$('#globalFormContainer').append(verifyUserView.render()).show()

        // Reset the currently active public view
        this.activePublicView = verifyUserView
    },

    renderError: function(pageRoute) {
        // Destroy any outstanding public views before rendering a new one.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }
        this.activeFormViews.removeAll()

        // Initialize the global error view.
        this.showParticleBackground()
        var errorView = this.initializeErrorView()
        errorView.parseOptions(pageRoute.options)
        this.$('#globalFormContainer').append(errorView.render()).show()

        // Reset the currently active public view
        this.activePublicView = errorView
    },

    renderLogout: function(forwardRoute, options) {
        var _this = this

        // TODO: Parse options here and pass them on to the session model. For
        // simplicity will just pass an empty object for now.
        App.session.logout({}, {
            success: function() {
                VERBOSE('Later bro')

                // Hide the content wrapper
                _this.hideContent()

                // Reload the main page - Forces refresh of all views and models
                App.NavigationManager.refreshToBaseURL(options)
            },
            error: function(err) {
                ERROR(err)
            }
        })
    },

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Page Handlers)

    showPage: function(pageRoute) {
        DEBUG('AppView : Showing page')
        // Before showing any view, there are a series of validations that need to
        // run to ensure the expected app behavior.
        //  1) If the app has not been initialized yet then bail. All this means is
        //     the app is still being initialized via `AppView.renderInit` but
        //     Backbone has processed the route from the current URL fragment. Once
        //     initialization has completed, `AppView.renderInit` will take care of
        //     calling this again.
        //  2) Ensure the pageRoute is always an object.
        //  3) Check the authorization status of the request. If the requester is
        //     not permitted access to this route then send them to the login page.
        //  4) Ensure that all app containers have been rendered in the DOM
        //  5) Remove any outstanding registration, signup, or login pages from DOM
        //     before showing the requested page. This cleanup is necessary since
        //     these views live outside of the site content wrapper.
        //  6) Ensure the site content wrapper is visible.
        VERBOSE('App initialization -->' + this.isInitialized)
        if (!this.isInitialized) {
            return
        }
        if (!pageRoute) {
            pageRoute = {}
        }

        if (!this.isAuthorized(pageRoute)) {
            VERBOSE('pageRoute ' + pageRoute + 'is authorized')
            return this.redirectToLogin(pageRoute)
        }
        if (!this.isViewRendered) {
            this.render()
        }
        // TODO: Remove this once all other form views are updated to use the
        // `activeFormViews` subview helper.
        if (this.activePublicView) {
            this.activePublicView.destroy()
        }
        this.activeFormViews.removeAll()
        //this.removeParticleBackground()
        this.$('#globalFormContainer').hide()

        if (!this.$(this.elContent).is(':visible')) {
            this.showContent()
        }

        // If a valid `dest_url` param value was given, then redirect.
        /*    var redirectTo = AppUtil.getRedirectUrlFromOptions(pageRoute.options)
    if (redirectTo) {
      App.NavigationManager.redirectToUrl(redirectTo)
      return
    }*/

        // Upon completion of the validation chain, set the requested page route on
        // the AppModel in order to trigger a page change event.
        this.appModel.setCurrentPageRoute(pageRoute)
    },

    redirectToLogin: function(pageRoute) {
        ERROR('User is not currently authenticated to the portal')
        App.session.set('loginStatus', false)

        // Destroy the header, footer, and all cached pages. Also, render the
        // AppView to recreate all content containers.
        if (this.headerView) {
            this.headerView.destroy()
        }
        if (this.footerView) {
            this.footerView.destroy()
        }
        this.subViewHelper.removeAll()


        var authUrl =
            '/api/v1/auth/wso2'
            /* +
      '?successRedirect=' + encodeURIComponent(window.location.href)*/

        App.NavigationManager.redirectToUrl(authUrl)
    },


    // Handler for change on page route
    onChangePageRoute: function() {
        DEBUG('AppView : Observed page route change')

        var pageRoute = this.appModel.getCurrentPageRoute(),
            pageId = pageRoute ? pageRoute.pageId : null

        // Hide the previous view
        if (this.currentPageId &&
            this.currentPageId !== pageId &&
            this.subViewHelper.get(this.currentPageId)) {
            VERBOSE('Page route has changed. Lets cache ' + this.currentPageId)
            this.subViewHelper.get(this.currentPageId).hide()
        }

        // Check the number of pages in the DOM and remove the stale one if
        // space is needed.
        if (!this.subViewHelper.get(pageId)) {
            if (this.subViewHelper.getIds().length >= this.MAX_PAGE_LIMIT) {
                // Find the most stale page
                var subViews = this.subViewHelper.subviews,
                    initialViewId = this.subViewHelper.getIds()[0],
                    stalePageView = _.reduce(subViews, function(prev, next) {
                        var prevAccessTime = prev.getLastAccessTime(),
                            nextAccessTime = next.getLastAccessTime()

                        return (prevAccessTime > nextAccessTime) ? prev : next

                    }, this.subViewHelper.get(initialViewId))

                // Remove the stale page from the cache
                VERBOSE('AppView: Removing pageId: ' + stalePageView.pageId)
                this.subViewHelper.remove(stalePageView.pageId)
                stalePageView = null
                this.currentPageView = null
            }
        }

        // Change the page
        var pageView = this.subViewHelper.get(pageId)
        this.currentPageId = pageId

        // If the pageView object already exists, then show it. Otherwise, let's
        // render the page from scratch.
        if (pageView) {
            VERBOSE('looks like we have a cached version of ' + pageView.pageId)
            // Set the last access time for the page.
            pageView.setLastAccessTime(new Date().getTime())

            // Show the page
            pageView.show(pageRoute)
        } else {
            // Load the page
            this.loadPageView(pageId)
        }

        // Scroll to top of the page when the view changes
        window.scrollTo(0, 0)
    },

    loadPageView: function(pageId) {
        DEBUG('loading page ' + pageId)

        // If an empty page route has been given then navigate the user to the
        // the default page.
        if (!pageId) {
            return App.NavigationManager.navigateToPage('plans')
        }

        // Otherwise, attempt to render the page view associated with the requested
        // page route. If we can't find a matching page, then display a 404 error.
        switch (pageId) {
            // TODO: Move these page IDs to an AppConstants file.
            case 'plans':
                this.renderPageView(App.Views.Plans)
                break
            case 'billing':
                this.renderPageView(App.Views.Billing)
                break
            case 'successSubscription':
                this.renderPageView(App.Views.SuccessSubscription)
                break
            case 'usage':
                this.renderPageView(App.Views.PostUsageView);
                break
            case 'errorSubscription':
                this.renderPageView(App.Views.ErrorSubscription)
                break
            default:
                App.NavigationManager.navigateToPage('error', '404')
        }
    },

    renderPageView: function(PageViewClass) {
        DEBUG('AppView : Rendering page view')
        var pageView = new PageViewClass()

        // Set the last access time for the page.
        pageView.setLastAccessTime(new Date().getTime())

        // Render the header/footer views if needed and add in the rendered page.
        if (!this.headerView.isRendered) {
            this.headerView.render()
        }
        this.$('#n-ctr-page').append(pageView.render())

        pageView.afterRender()

        // Because we're loading the page asynchronously, the selected page
        //  could've been changed after loading. Before showing, ensure the
        //  currentPageId is the same as the loaded page, otherwise hide it.
        if (this.currentPageId === pageView.pageId) {
            pageView.show(this.appModel.getCurrentPageRoute())
        } else {
            pageView.hide()
        }

        // Register the pageView to the subViewHelper
        this.subViewHelper.register(pageView.pageId, pageView)
    },

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Util)

    isPublicUser: function isPublicUser(session) {
        // TODO: The duplicate storage of user information within SessionModel
        // should be addressed.
        //var groupId = session.user.get('groups')[0].groupId
        //return session && groupId === AppConstants.PUBLIC_GROUP_ID

        return session === AppConstants.PUBLIC_GROUP_ID
    },

    isPublicRoute: function isPublicRoute(pageRoute) {
        var pageId = pageRoute.pageId
        return pageRoute && _.contains(AppConstants.PUBLIC_PAGE_IDS, pageId)
    },

    isAuthorized: function isAuthorized(pageRoute) {
        var isPublicUser = this.isPublicUser(App.session)
        var isPublicRoute = this.isPublicRoute(pageRoute)

        VERBOSE('Checking if user is authorized')
        VERBOSE(App.session.isLoggedIn())

        // Access will be denied if the current request is:
        //  1) Not coming from the default public user and no valid login session
        //     has been established.
        //  2) Coming from the default public user but the route is not public.
        if (!isPublicUser && !App.session.isLoggedIn()) {
            return false
        }
        if (isPublicUser && !isPublicRoute) {
            return false
        }

        // Otherwise, access is granted.
        return true
    },

    // Shows the content holder with transition
    showContent: function() {
        this.$(this.elContent).fadeIn(250);
    },

    // Hides the content holder with transition
    hideContent: function() {
        this.$(this.elContent).fadeOut(300);
    },

    /**
     * Add the particle background to the DOM.
     */
    showParticleBackground: function() {
        if (this.$('#particles-foreground, #particles-background').length === 0) {
            App.ParticlegroundManager.show()
        }
    },

    /**
     * Remove the particle background from the DOM.
     *
     * TODO: Investigate if removing the particle elements from the DOM actually
     * stops the processing logic within `ParticlegroundManager`.
     */
    removeParticleBackground: function() {
        App.ParticlegroundManager.destroy()
    },

    /////////////////////////////////////////////////////////////////////////////
    // Functions (Data and View Refresh)

    // Refreshes the view with new data. This is called when an entity has
    // been created/updated.
    // @param  model  : The model that has been created/added/deleted
    refreshView: function(model) {
        DEBUG('AppView: The page data to be refreshed is: ' +
            this.currentPageId)

        // Refresh the current page
        if (this.subViewHelper.get(this.currentPageId)) {
            this.subViewHelper.get(this.currentPageId).refreshView(model)
        }
    }

})