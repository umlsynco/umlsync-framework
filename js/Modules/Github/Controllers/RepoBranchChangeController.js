define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                // TODO: Make local view triggers instead of global
                // this.RepoView = options.repoView;
                // this.BranchView = options.branchView;
                this.GithubController = options.controller;
                var that = this;
                // Repository operations
                Framework.vent.on("github:repo:selected", function (data) {
                    that.onGithubRepoOrBranchSelected(data, true);
                });

                Framework.vent.on("github:branch:selected", function (data) {
                    that.onGithubRepoOrBranchSelected(data, false);
                });
            },
            onGithubRepoOrBranchSelected: function(data, isRepoFlag) {
                var info = this.GithubController.getViewInfo();

                // Do nothing if the same repo was selected
                if (isRepoFlag) {
                    if (info.repo == data.model.get("full_name")) {
                        return;
                    }
                }
                else {
                    if (info.branch == data.model.get("name")) {
                        return;
                    }
                }
				
				var ghc = this.GithubController;
                this.GithubController.HandleOpenedContent({
                    close:true,
                    done: function() {
                        // On commit completion
						if (isRepoFlag)
						  ghc.SyncModelsController.SetActiveRepo(data.model);
						else
						  ghc.SyncModelsController.SetActiveBranch(data.model);

                    },
                    cancel: function() {
                        // On Commit cancel
                    },
                    skip: function() {
                        // Skip commit -> change repo/branch
                    }
                });
            }
        });
        return Controller;
    }
);

