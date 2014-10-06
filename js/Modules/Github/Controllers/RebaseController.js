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
                dfd.resolve();

                // skip HEAD reload
                if (!options.commitDone) {
                    // reload branch
                    pms
                        .then(this.reloadHead)
                        .then(_.bind(this.checkForConflicts, this))
                        .then(_.bind(this.syncContent, this));
                }
            },

            //
            // Get HEAD of branch and compare with current
            //
            reloadHead: function() {
                this.Branch.fetch({reset:true})
            },

            //
            // Check for conflict with modified content
            //
            checkForConflicts: function() {
                var dfd = $.Deferred();
                dfd.resolve();
                return dfd.promise();
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
