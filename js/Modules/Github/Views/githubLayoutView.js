define(['jquery',
        'marionette',
        'github',
        'Collections/toolboxIconsCollection',
        'Views/Controls/toolboxView',
        'Views/framework',
        'Views/Controls/treeView',
        '../Collections/contentCacheCollection',
        'Views/Menus/dropDownMenu',
        'Modules/Github/backend',
        'Views/Dialogs/commitDialog',
        'Modules/Github/Controllers/syncModelController'
    ],
    function ($, Marionette, Github, ToolboxCollection, ToolboxView, Framework, TreeView, CacheCollection, DropdownView, GHB, CommitDialog, syncController) {
        var githubLayout = Marionette.LayoutView.extend({
            template: "#github-content-layout",
            regions: {
                repository: "#us-viewmanager", // Repository selection region
                branch: "#us-branch", // branch selection region
                toolbox: "#us-toolbox", // Toolbox region
                reposelect: "#us-repo-select", // Repo select drop down menu
                branchselect: "#us-branch-select", // Repo select drop down menu
                tree: "#us-treetabs" // Tree region
            },
            initialize: function () {
			    // Working stack to push event and context
			    this.workingStack = new Array();
				// Toolbox
                this.ToolboxCollection = new ToolboxCollection();
                this.ToolboxCollection.add([
                    {   name: 'github-new',
                        title: 'New content',
                        icon: 'images/newdoc.png',
                        cssClass: 'left'},
                    {   name: 'github-revertdoc',
                        title: 'Revert changes',
                        icon: 'images/revertdoc.png',
                        cssClass: 'left'},
                    {   name: 'github-removedoc',
                        title: 'Remove content',
                        icon: 'images/removedoc.png',
                        cssClass: 'left'},
                    {   name: 'github-commit',
                        title: 'Commit changes',
                        icon: 'images/commit.png',
                        cssClass: 'right'},
                    {   name: 'github-reload',
                        title: 'Reload tree',
                        icon: 'images/reload.png',
                        cssClass: 'right'}
                ]);

				var that = this;
                // Repository operations
                Framework.vent.on("github:repo:selected", function (data) {
				    that.onGithubRepoOrBranchSelected(data, true);
                });

                Framework.vent.on("github:branch:selected", function (data) {
                    that.onGithubRepoOrBranchSelected(data, false);
                });


                Framework.vent.on("github:repo:change", function (data) {
                    that.onGithubRepoChange(data);
                });

                Framework.vent.on("github:branch:change", function (data) {
                    that.onGithubBranchChange(data);
                });

                Framework.vent.on("github:repo:commit", function (data) {
                    that.onGithubRepoCommit(data);
                });

                // Stack of commands
				Framework.vent.on("github:stack:continue", function (data) {
				    that.onGithubStackContinue(data);
                });
                Framework.vent.on("github:stack:cancel", function (data) {
                    that.onGithubStackCancel(data);
                });

                // Listeners of content manager
                Framework.vent.on("content:syncall:cancel", function (data) {
                    that.onContentSyncallCancel(data);
                });
                Framework.vent.on("content:syncall:complete", function (data) {
                    that.onContentSyncallComplete(data);
                });

			},
            // Layered view was rendered
            onRender: function (options) {
                var that = this;

                this.activateToolbox();
                this.activateRepoAndBranch();
                this.activateTree();
                this.activateContentCache({cacheLimit: 20});

                // Controller which is responsible for models sync-up
                this.syncController = new syncController({
                    repo: this.RepoModel,
                    refs: this.BranchModel,
                    tree: this.TreeModel,
                    cache: this.ContentCache
                });

            },

            resize: function(event, width, height) {
                var res;
                if (this.toolbox.currentView) {
                    res = this.toolbox.currentView.resize(event, width, height);
                }

                if (this.tree.currentView) {
                    this.tree.currentView.resize(event, width, height - res.height);
                }
            },

            ////////////////////////////////////// INITIALIZATION STUFF ////////////////////////////////////////////////
            //
            // Toolbox for content management: Add, Remove, commit,  reload etc
            //
            activateToolbox: function() {
                // Initialize toolbox view
                this.ToolboxView = new ToolboxView({
                    childViewEventPrefix: 'github',
                    collection: this.ToolboxCollection
                });

                this.ToolboxView.on("github:toolbox:click", function () {
                    Framework.vent.trigger('content:syncall', {view:'github', branch: 'master'});
                });

                this.toolbox.show(this.ToolboxView);
            },

            //
            // DropDown menu for repository and branch selection
            //
            activateRepoAndBranch: function() {
                this.User = Framework.Backend.Github.getUser();
                this.User.fetch();

                this.RepoModel = this.User.getRepositories();

                var repoView = new (DropdownView.extend({
                    childViewEventPrefix: "github:repo",
                    groups:this.RepoModel.groups,
                    title:"Repository",
                    uid: "repo"
                }))({collection:this.RepoModel});

                this.reposelect.show(repoView);

                // Branch select model depends on repo select model
                // but it doesn't required to re-render full model
                // only itemViews have to be updated.
                this.BranchModel = Framework.Backend.Github.getRefs();

                var branchView = new (DropdownView.extend({
                    childViewEventPrefix: "github:branch",
                    groups:this.BranchModel.groups,
                    title:"Branch",
                    uid: "branch"
                }))({collection:this.BranchModel});
                this.branchselect.show(branchView);
            },

            //
            // There is no reason to create tree model and view
            // without repo/branch selection
            //
            activateTree: function () {

                this.TreeModel = Framework.Backend.Github.getTree();
                this.TreeModel.on("remove", function () {
                    // Handle remove item use-case
                });

                this.TreeView = new TreeView({collection: this.TreeModel});
                this.tree.show(this.TreeView);

                var that = this;
                this.TreeView.on("file:focus", function (data) {
                    that.contentInFocus(data);
                });
            },

            //
            // Content cache contain the number of loaded files and all modified and added files
            // There is no way to keep in cache all loaded content therefore it will get garbage collection event
            // from time to time
            //
            activateContentCache: function(options) {
                var that = this;
                this.contentCache = new CacheCollection();

                Framework.vent.on("github:file:load", function(data) {
                    that.loadContent(data);
                });
				Framework.vent.on("github:file:save", function(data) {
				  that.saveContent(data);
				});
            },

            ////////////////////////////////////// CONTENT CACHE FUNCTIONALITY /////////////////////////////////////////
            //
            // Send event to mediator to ask if we could open this content
            //
            contentInFocus: function (data) {
                var clone = $.extend({}, data, {
                    isOwner: true, // Indicates if user could modify this file
                    repo: this.activeRepo,
                    branch: this.activeBranch, // Branch name
                    view: 'github' // view identifier - GitHub or something else
                });

                Framework.vent.trigger("content:focus", clone);
            },

            //
            // Save content
            //
            saveContent: function(data) {
                if (!data.key)
                    return;

                var model = this.contentCache.where({key:data.key});
                //
                // Expected only one instance of content
                //
                if (model.length > 1) {
                    alert("content was loaded twice !");
                }
                //
                // if content was cached
                //
                else if (model.length == 1) {
				  // Saved content
				  model[0].set("modifiedContent", data.modifiedContent);
				}
				else {
				  alert("model was not found in cache");
				}
			},

            //
            // Respond from mediator to load content
            //
            loadContent: function(data) {
                if (!data.key)
                    return;

                var model = this.contentCache.where({key:data.key});
                //
                // Expected only one instance of content
                //
                if (model.length > 1) {
                    alert("content was loaded twice !");
                }
                //
                // if content was cached
                //
                else if (model.length == 1) {
                    Framework.vent.trigger("content:loaded", _.clone(model[0].attributes) );
                }
                //
                // get content from github
                //
                else {
                    this.contentCache.fetch({
                        add: true,
                        remove:false,
                        merge: false,
                        data: data
                    });

                    // trigger loaded
                    this.contentCache.on("add", function(model) {
                        Framework.vent.trigger("content:loaded", _.clone(model.attributes));
                    });

                    // trigger failed to load
                    this.contentCache.on("error", function(model) {
                        Framework.vent.trigger("content:loaded", _.clone(model.attributes));
                    });
                }
            },
			onContentSyncallComplete: function(data) {
			  Framework.vent.trigger('github:stack:continue', data);
			},
			onContentSyncallCancel: function(data) {
			  Framework.vent.trigger('github:stack:cancel', data);
			},
			//
			// Pop event and context from queue
			//
			onGithubStackContinue: function(data) {
			  var next = this.workingStack.pop();
			  if (next) {
			    Framework.vent.trigger(next.event, next.context || data);
			  }
			},
			onGithubStackCancel: function(data) {
			  this.workingStack = new Array();
			},
			//////////////////////////// REPO CHANGE
            onGithubRepoOrBranchSelected: function(data, isRepoFlag) {
				    var triggerContinue = false;
				    // Do nothing if the same repo was selected
				    if (isRepoFlag) {
                        if (this.activeRepo == data.model.get("full_name")) {
                            return;
                        }
                        this.workingStack.push({event:"github:repo:change", context:data});

                        triggerContinue = !this.activeRepo;
					}
                    else {
                        if (this.activeBranch == data.model.get("name")) {
                            return;
                        }
                        this.workingStack.push({event:"github:branch:change", context:data});

                        triggerContinue = !this.activeBranch; // happens automatically (because we have default branch)
                    }

					// Force open if repo was not selected before
					if (triggerContinue) {
					  Framework.vent.trigger('github:stack:continue');
					  return;
					}

                    // Commit repo changes in both cases
					this.workingStack.push({event:"github:repo:commit", context:data});
					
                    Framework.vent.trigger('content:syncall', {view:'github', repo:this.activeRepo, branch: this.activeBrach});
			},

			onGithubRepoChange: function(data) {
              this.syncController.SetActiveRepo(data.model);
			},
            //
            // COMMIT DIALOG
            //
            onGithubRepoCommit: function(data) {
			    if (!_.some(this.contentCache.models, function(model) {
				  return model.has('modifiedContent');
				})) {
				  Framework.vent.trigger("github:stack:continue",data);
				  return;
				}
                var dialog = new CommitDialog({collection:this.contentCache});
                var that = this;
                dialog.on("button:commit", function(data) {
                    if (that.contentCache.when({waitingForCommit:true}).length > 0) {
                        Framework.vent.trigger("github:repo:commit:start",data);
                    }
                    else {
                        Framework.vent.trigger("github:stack:continue",data);
                    }
                });

                dialog.on("button:cancel", function(data) {
                    Framework.vent.trigger("github:stack:cancel",data);
                });

                Framework.DialogRegion.show(dialog, {forceShow: true});
            },

            //
            // Implements repo commit behavior
            //
            onGithubRepoCommitStart: function(data) {
                var models = that.contentCache.when({waitingForCommit:true});
                if (models.length > 0) {

                    Framework.vent.trigger("github:repo:commit:checkhead");


                    // Save triggers create blob
                    _.each(model, function(model) {
                        model.save();
                    });
                }
            },
            //
            // Implements repo commit strategy
            //
            onGithubRepoCommitContinue: function(data) {

            },
            //
            // Implements repo commit strategy
            //
            onGithubRepoCommitComplete: function(data) {

            },
            //
            // Implements repo commit strategy
            //
            onGithubRepoCommitFailed: function(data) {

            },
            //
            // change the github branch
            //
            onGithubBranchChange: function(data) {
                this.syncController.SetActiveBranch(data.model);
            }
        });


        Framework.addInitializer(function (options) {
            this.registerDataProvider('GitHub', githubLayout);
        });

        return githubLayout;
    });

