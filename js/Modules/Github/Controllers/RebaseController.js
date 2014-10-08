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
                var pms = dfd.promise();


                // skip HEAD reload
                if (!options.commitDone) {
                    // reload branch
                    pms = pms.then(_.bind(this.reloadHead, this))
                }

                // Highlight the conflicts
                pms.pipe(_.bind(this.reloadTree, this))
                   .pipe(_.bind(this.checkForConflicts, this))
                   .then(_.bind(this.syncContent, this));
                dfd.resolve();
                return pms;
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
                      dfd.resolve({oldCommit:oldCommit, newCommit:thatBranch.get("commit")});
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
            reloadTree: function(res, x) {
                var dfd = $.Deferred();
                // Do nothing is there is no conflicts
// TODO: REMOVE ON TEST DONE
//                if (res.oldCommit.sha == res.newCommit.sha) {
//                    dfd.reject({reason:"cancel", message:"nothing"});
//                    return dfd.promise();
//                }

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
                var that = this;
                _.each(this.ContentCache.where({status:"new"}), function(model) {
                    var absPath = model.get("absPath");
                    pms.then(_.bind(that.loadPath, that, absPath)).pipe(function(treeItem) {
                        if (model.get("baseSha") == treeItem.get("sha")) {
                            that.highlightConflict(model, treeItem);
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
            // Extend tree with
            //
            highlightConflict: function(model, treeItem) {
                treeItem.set({status:"conflict", baseSha: model.get("baseSha")});
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
