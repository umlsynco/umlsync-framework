define(['marionette',
        'Views/framework',
        'Views/Dialogs/commitDialog'
    ],
    function(Marionette, Framework, CommitDialog) {
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
                // 7. sync-up cache
                pms
                    .then(_.bind(this.commitDialog, this))
                    .then(_.bind(this.commitBlobs, this))
                    .then(_.bind(this.updateTree, this))
                    .pipe(_.bind(this.makeCommit, this))
                    .pipe(_.bind(this.changeHead, this))
                    .then(_.bind(this.syncAllChanges, this));

                return pms;
            },
            //
            // COMMIT DIALOG
            //
            commitDialog: function(data) {
                var dfd = $.Deferred();
                if (!_.some(this.ContentCache.models, function(model) {
                    return (model.get("status") == "new");
                })) {
                    dfd.reject("nothing");
                    return dfd.promise();
                }

                var dialog = new CommitDialog({collection:this.ContentCache});
                var that = this;
                dialog.on("button:commit", function(data) {
                    if (that.ContentCache.where({waitingForCommit:true}).length > 0) {
                        dfd.resolve();
                    }
                    else {
                        dfd.reject("nothing");
                    }
                });

                dialog.on("button:cancel", function(data) {
                    dfd.reject("cancel");
                });

                Framework.DialogRegion.show(dialog, {forceShow: true});

                return dfd.promise();
            },
            //
            // Make blob for each selected content item
            //
            commitBlobs: function() {
                var models = this.ContentCache.where({status: "new", waitingForCommit:true});

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
              var models = this.ContentCache.where({status: "new", waitingForCommit:true});
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
            // Resolve changes
            //
            syncAllChanges: function(context) {
                var dfd = $.Deferred();

                // Update Cache
                _.each(this.ContentCache.where({status:"new"}),
                  function(model) {
                      if (model.get("waitingForCommit")) {
                          // change status of the model
                          model.set({status:"loaded"});
                      }
                      // remove attribute
                      model.unset("waitingForCommit");
                });
                dfd.resolve();
                return dfd.promise();
            }
        });

        return Controller;
    }
);


