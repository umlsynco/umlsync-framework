/*
 * Facade for controllers is an abstraction
 */


define(['marionette',
        'Views/framework',
        'Views/Controls/treeView'
    ],
    function(// Basic
             Marionette, Framework,
             // Views
             TreeViewController) {

        var Facade = Marionette.Controller.extend({
            initialize: function(options) {
                this.Regions = options.regions;

                this.activateModelsAndView();
            },

            //
            // DropDown menu for repository and branch selection
            //
            activateModelsAndView: function() {
                //////////////////////////////// TREE
                this.TreeModel = Framework.Backend.Github.getTree();
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
                // Controller which is responsible for models sync-up
                this.SyncModelsController = new SyncModelController({
                    repo: this.RepoModel,
                    refs: this.BranchModel,
                    tree: this.TreeModel,
                });

                // Load content in focus and implement the content cache
                // functionality (priority queue, number of references etc).
                this.LoadContentController = new LoadContentController({
                    treeViewController: this.TreeViewController, // Tree view
                    controller: this // To provide actual data on getViewInfo()
                });

                this.RbcController = new RBController({controller:this});
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
                        repo: this.SyncModelsController.getActiveRepoName(),
                        branch: this.SyncModelsController.GetActiveBranchName(), // Branch name
                        view: 'github' // view identifier - GitHub or something else
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
            //
            // Commit changes controller
            //
            CommitChanges: function(options) {
                // 1. HandleOpenedContent - close/save all modified items
                // 2. Check HEAD of the branch and resolve conflicts if any
                // 3. Make commit
                // 4. Reload tree/branch
                var that = this;
                this.HandleOpenedContent({
                    done: function () {
                        new CommitChangesController($.extend({},options, {
                            controller: that,
                            tree: that.TreeModel,
                            branch:that.SyncModelsController.GetActiveBranch(),
                            contentCache: that.ContentCache
                        }));
                    }
                });
            },

            //
            // Rebase tree controller
            //
            Rebase: function(options) {
                new RebaseController(($.extend({}, options, {
                    controller:this,
                    tree: this.TreeModel,
                    branch:this.SyncModelsController.GetActiveBranch(),
                    contentCache: this.ContentCache})));
            },

            //////////////////////////////////////////// CONTENT API
            //
            // Trigger new content creation dialog (including path search/load controller)
            //
            NewContent: function() {
              new NewController({
				     tree: this.TreeModel,
                     treeController: this.TreeViewController,
                     cache: this.ContentCache,
                     branch:this.SyncModelsController.GetActiveBranch()
				  });
            },
            //
            // Revert content + dialog
            //
            RevertContent: function(){

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
