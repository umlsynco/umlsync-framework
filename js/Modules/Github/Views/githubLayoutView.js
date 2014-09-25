define(['jquery',
        'marionette',
        'github',
        'Collections/toolboxIconsCollection',
        'Views/Controls/toolboxView',
        'Views/framework',
        'Modules/Github/backend',
        'Views/Dialogs/commitDialog',
        'Modules/Github/Controllers/GithubControllersFacade'
    ],
    function ($, Marionette, Github, ToolboxCollection, ToolboxView, Framework, GHB, CommitDialog, Facade) {
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

			},
            // Layered view was rendered
            onRender: function (options) {
                var that = this;

                this.activateToolbox();
                this.Facade = new Facade({regions:this});
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

