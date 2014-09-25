//
// The major responsibility of this controller is to sync-up
// collections of repositories, branches, tree and content cache.
// So, it is custom behavior and could not be part of the
// marionette.github.js
//

define(['marionette',
        'Views/framework'],
    function(Marionette, Framework) {
        var SyncModelsController = Marionette.Controller.extend({
            //
            // Provide all controllable items
            //
            initialize: function (options) {
                this.RepoModel = options.repository;
                this.Refs = options.refs;
                this.Tree = options.tree;
                this.ContentCache = options.cache;
            },

            //
            // Get the name of the active repository
            //
            getActiveRepoName: function() {
              return this.activeRepo || "none";
            },

            //
            // Change active repository
            //
            SetActiveRepo: function(model) {
                // Disable isActive for the previous repo
                if (this.activeRepo) {
                    var models = this.Repo.where({isActive:true}); // full_name:this.activeRepo,
                    if (models.length == 1) {
                        models[0].set({isActive:false});
                    }
                }
                // set an active repository
                this.activeRepo = model.get("full_name");

                // lead to dropdown dialog change
                model.set({isActive:true});

                // as far as we trust to Github.API we could extract the list of branches
                // and reload tree in parallel
                this.activeBranch = model.get("default_branch") || 'master';

                // reload the list of branches/tags for repository
                var that = this;
                this.Refs.setRepository(model, {reset:true, add:true, merge:true, success: function() {
                    var branch = that.Refs.getBranch(that.activeBranch);
                    that.Tree.setBranch(branch);
                    that.ContentCache.setBranch(branch);
                }});
            },

            //
            // Get the name of active branch
            //
            GetActiveBranchName: function() {
                return this.activeBranch || "none";
            },

            //
            // Change an active branch
            //
            SetActiveBranch: function(model) {
                // Disable isActive for the previous branch
                if (this.activeBranch) {
                    var models = this.Refs.where({isActive:true});// full_name:this.activeBranch
                    if (models.length == 1) {
                        models[0].set({isActive:false});
                    }
                }
                // set an active branch
                this.activeBranch = model.get("name");

                // lead to dropdown dialog change
                model.set({isActive:true});

                this.Tree.setBranch(model);
                this.ContentCache.setBranch(branch);
            }
        });

        return SyncModelsController;
    }
);
