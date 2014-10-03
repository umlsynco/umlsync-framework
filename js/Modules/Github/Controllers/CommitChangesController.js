define(['marionette',
        'Views/framework'],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({

            initialize: function (options) {
                this.TreeModel = options.tree;            // tree cache
                this.ContentCache = options.contentCache; // Cache of content
                this.Branch = options.branch;             // head of the changeable branch
                var that = this;

                $.when(this.start()).then(options.success, options.cancel).always(function() {
                    that.destroy(); // self-destroy on completion
                });
            },
            start: function() {
                var dfd = $.Deferred();
                var pms = dfd.promise();
                dfd.resolve();
                // TODO: make it more pipe-oriented
                // 1. get all modified items
                // 2. open commit dialog
                // 3. get selected items from the pipe and commit them
                // 4. provide the list of committed items to the tree via pipe and update tree
                // 5. pipe-get an updated tree and make a commit
                // 6. pipe-get a commit object and put it on HEAD of branch
                // 7. sync-up cache and reload tree
                pms
                    .then(_.bind(this.commitBlobs, this))
                    .then(_.bind(this.updateTree, this))
                    .pipe(_.bind(this.makeCommit, this))
                    .pipe(_.bind(this.changeHead, this));

                return pms;
            },
            //
            // Make blob for each selected content item
            //
            commitBlobs: function() {
                var models = this.ContentCache.where({status: "new"});

                var dfd = $.Deferred();
                var pms = dfd.promise();
                _.each(models, function(model) {
                    pms = pms.then(_.bind(model.getSavePromise, model));
                });

                dfd.resolve(models);
                return pms;
            },
            //
            // patch base tree with a new blobs
            //
            updateTree: function() {
              var models = this.ContentCache.where({status: "new"});
              return this.TreeModel.getSavePromise(models);
            },
            //
            // Make a commit git object
            //
            makeCommit: function(resultTree) {
                var commitData = $.parseJSON(resultTree);
                var commit = this.Branch.createCommit(commitData.sha, "Test commit");
                return commit.getSavePromise();
            },
            //
            // Getting the result commit object and move it on the
            // HEAD of the current branch
            //
            changeHead: function(resultCommit) {
                return this.Branch.getSavePromise(resultCommit)
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
            }
        });

        return Controller;
    }
);


