define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework, CommitDialog) {
        var Controller = Marionette.Controller.extend({

            //
            // Initialize rebase controller
            //
            initialize: function (options) {
                this.TreeModel = options.tree;            // tree cache
                this.ContentCache = options.contentCache; // Cache of content
                this.Branch = options.branch;             // head of the changeable branch
                var that = this;

                $.when(this.start(options)).then(options.success, options.cancel).always(function () {
                    that.destroy(); // self-destroy on completion
                });
            },
            start: function(options) {
                // 1. Branch get HEAD
                // 2. Check if HEAD == oldHead
                // 3. Each content status = "new" ? check baseSha != new sha -> conflict (working, new, orign)
                // 4. Update all "loaded" content with num of ref_count > 0

                var dfd = $.Deferred();
                dfd.resolve();

                // skip HEAD reload
                if (!options.commitDone) {
                    // reload branch
                    dfd = dfd.pipe(this.reloadHead());
                }
                // Highlight the conflicts
                dfd.pipe(_.bind(this.reloadTree, this))
                   .then(_.bind(this.checkForConflicts, this))
                   .then(_.bind(this.syncContent, this));
                return dfd.promise();
            },

            //
            // Get HEAD of branch and compare with current
            //
            reloadHead: function() {
                var dfd = $.Deferred();

                var thatBranch = this.Branch,
                    oldCommit = this.Branch.get("commit");
                this.Branch.fetch({
                    reset:true,
                    success: function(x, y, z) {
                      dfd.resolve({old:oldCommit, new:thatBranch.get("commit")});
                    },
                    error: function(x, y, z) {
                      dfd.reject({
                          reason:'error',
                          message:'Failed to fetch head of branch: ' + thatBranch.get("name")});
                    }
                });
                return  dfd.promise();
            },

            //
            // Trigger reload tree if HEAD sha was changed since last pull request
            //
            reloadTree: function(res) {
                var dfd = $.Deferred();
                // Do nothing is there is no conflicts
                if (res.oldCommit.sha == res.newCommit.sha) {
                    dfd.resolve();
                    return dfd.promise();
                }

                // Branch was reloaded
                this.TreeModel.setBranch(this.Branch, {
                    success: function(z,y,z) {
                        dfd.resolve();
                    },
                    error: function() {
                        dfd.reject({reason: "error", message:"Failed to reset branch!"});
                    }
                });
                return dfd.promise();
            },

            //
            // Check for conflict with modified content
            //
            checkForConflicts: function() {
                var dfd = $.Deferred();
                var pms = dfd.promise();
                _.each(this.ContentCache.where({status:"new"}), function(model) {
                    pms.then(this.loadPath(model.get("absPath"))).pipe(function(sha) {
                        if (model.get("sha") != sha) {
                            // Parse conflict
                        }
                    });
                });
                dfd.resolve();
                return pms;
            },

            //
            // Load tree path
            //
            loadPath: function(absolutePath) {
                return this.TreeModel.loadPath(absolutePath);
            },

            //
            // Reload all opened items if content sha was changed
            //
            syncContent: function() {
                var dfd = $.Deferred();
                dfd.resolve();
                return dfd.promise();
            }
        });
        return Controller;
    }
);
