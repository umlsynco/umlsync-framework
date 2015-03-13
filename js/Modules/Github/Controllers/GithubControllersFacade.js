/*
 * Facade for controllers is an abstraction
 */


define(['marionette',
        'Views/framework',
        'Views/Controls/treeView',
        'Views/Menus/dropDownMenu',
        './SyncModelController',  // Controller to synchronize models
        './LoadContentController',// Load content in focus if needed
        './SyncTabsController',   // Sync tabs controller
        './RepoBranchChangeController',
        './ToolboxController', // Github toolbox icons
        './CommitChangesController', // Controller to commit changes
        './RebaseController', // Pull request controller
        './NewContentController' // New content dialog
    ],
    function(// Basic
             Marionette, Framework,
             // Views
             TreeView, DropdownView,
             // Controllers
             SyncModelController, LoadContentController, SyncTabsController,
             RBController, ToolboxController, CommitChangesController, RebaseController, NewController) {
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
                this.User = Framework.Backend.Github.getUser();
                this.User.fetch();

                //////////////////////////////// REPOSITORIES
                this.RepoModel = this.User.getRepositories();

                this.RepoView = new (DropdownView.extend({
                    childViewEventPrefix: "github:repo",
                    groups:this.RepoModel.groups,
                    title:"Repository",
                    uid: "repo"
                }))({collection:this.RepoModel});

                this.Regions.reposelect.show(this.RepoView);

                //////////////////////////////// BRANCHES
                // Branch select model depends on repo select model
                // but it doesn't required to re-render full model
                // only itemViews have to be updated.
                this.BranchModel = Framework.Backend.Github.getRefs();

                // Branch select view
                this.BranchView = new (DropdownView.extend({
                    childViewEventPrefix: "github:branch",
                    groups:this.BranchModel.groups,
                    title:"Branch",
                    uid: "branch"
                }))({collection:this.BranchModel});

                // Branch select regions
                this.Regions.branchselect.show(this.BranchView);

                //////////////////////////////// TREE
                this.TreeModel = Framework.Backend.Github.getTree();
                this.TreeView = new TreeView({collection: this.TreeModel});
                this.Regions.tree.show(this.TreeView);

                //////////////////////////////// CONTENT CACHE
                this.ContentCache = Framework.Backend.Github.getContentCache();

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
                    cache: this.ContentCache
                });

                // Load content in focus and implement the content cache
                // functionality (priority queue, number of references etc).
                this.LoadContentController = new LoadContentController({
                    treeView: this.TreeView, // Tree view
                    cache: this.ContentCache, // Cache model
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
				  // [TBD] option
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
