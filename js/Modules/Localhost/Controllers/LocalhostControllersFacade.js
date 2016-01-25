/*
 * Facade for controllers is an abstraction
 */


define(['marionette',
        'Views/framework',
        'Views/Controls/treeView',
        './LoadContentController',// Load content in focus if needed
        './SyncTabsController',   // Sync tabs controller
        './ToolboxController', // Toolbox icons
        './NewContentController' // New content creation controller
    ],
    function(// Basic
             Marionette, Framework,
             // Views
             TreeViewController,
             // Controllers
             LoadContentController, SyncTabsController,
             ToolboxController, NewController) {
        var Facade = Marionette.Controller.extend({
            initialize: function(options) {
                this.Regions = options.regions;

                this.activateModelsAndView();
                this.activateControllers();
            },

            //
            // DropDown menu for repository and branch selection
            //
            activateModelsAndView: function() {
                //////////////////////////////// USER

                //////////////////////////////// TREE
                this.TreeModel = new Backbone.Collection({});
                this.TreeViewController = new TreeViewController({tree: this.TreeModel});
                this.TreeViewController.on("lazyload", function(model, onSuccess) {
                    model.collection.lazyLoad(model.getDynatreeData()).then(
                        function() {
                            onSuccess(model, true);
                        },
                        function() {
                            onSuccess(model, false);
                        }
                    );

                });
                this.Regions.tree.show(this.TreeViewController.getView());

                //////////////////////////////// TOOLBOX
                this.Toolbox = new ToolboxController({controller:this});
                this.Regions.toolbox.show(this.Toolbox.ToolboxView);
            },
            //
            // There are several controllers required to
            // sync-up the GitHub models, views and global tabs
            //
            activateControllers: function() {
                // Load content in focus and implement the content cache
                // functionality (priority queue, number of references etc).
                this.LoadContentController = new LoadContentController({
                    treeViewController: this.TreeViewController, // Tree view
                    controller: this // To provide actual data on getViewInfo()
                });
            },

            //
            // Helper method to provide extended description of content
            // to the tab view controller
            //
            getViewInfo: function(options) {
                return $.extend(
                    {},
                    {
                        isOwner: true, // Indicates if user could modify this file
                        view: 'localhost' // view identifier - GitHub or something else
                    },
                    options);
            },

            //
            // Instantiate controller which is responsible for
            // synchronization of tab view content
            //
            // @param options: {closeAll: true} - force all tabs close
            //                 {done: function} - callback on completion
            //                 {cancel: function} - callback on cancel
            //
            HandleOpenedContent: function(options) {
                new SyncTabsController($.extend({}, options, {controller:this}));
            },

            ////////////////////////////////////////////// TREE API
            //////////////////////////////////////////// CONTENT API
            //
            // Trigger new content creation dialog (including path search/load controller)
            //
            NewContent: function() {
              new NewController({
		     tree: this.TreeModel,
                     treeController: this.TreeViewController,
                     branch:this.SyncModelsController.GetActiveBranch()
              });
            },
            //
            // remove content + dialog
            //
            RemoveContent: function() {

            }
        });
        return Facade;
    }

);
