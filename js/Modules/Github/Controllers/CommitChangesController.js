define(['marionette',
        'Views/framework'],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({

            initialize: function (options) {
                this.TreeModel = options.tree;            // tree cache
                this.ContentCache = options.contentCache; // Cache of content
                this.Branch = options.Branch;             // head of the changeable branch
                var that = this;

                $.when(this.start()).then(options.success, options.cancel);

                // Stack implementation
                Framework.vent.on("github:stack:continue", function (data) {
                    that.onGithubStackContinue(data);
                });
                Framework.vent.on("github:stack:cancel", function (data) {
                    that.onGithubStackCancel(data);
                });

            },
            start: function() {
                var dfd = $.Deferred();
                var pms = dfd.promise();
                dfd.resolve();
                pms
                    .then(_.bind(this.commitBlobs, this))
                    .then(_.bind(this.makeCommit, this))
                    .then(_.bind(this.changeHead, this));

                return pms;
            },
            commitBlobs: function() {
                var models = this.ContentCache.where({status: "new"});

                var dfd = $.Deferred();
                var pms = dfd.promise();
                _.each(models, function(model) {
                    pms = pms.then(model.getSavePromise());
                });

                dfd.resolve(models);
                return pms;
            },
            updateTree: function() {
                var dfd = $.Deferred();
                dfd.resolve();
                return dfd.promise();
            },
            makeCommit: function() {
                var dfd = $.Deferred();
                dfd.resolve();
                return dfd.promise();
            },
            changeHead: function() {
                var dfd = $.Deferred();
                return dfd.promise();
            },
            onGithubRepoCommitContent: function() {
                var commitModels = this.contentCache.where({waitingForCommit:true});
                if (commitModels.length > 0) {
                    commitModels[0].on("save", this.onGithubRepoCommitContent, this);
                }
                else {
                    this.onGithubRepoCommitTree();
                }
            },
            onGithubRepoCommitTree: function() {
                var models = this.contentCache.where({committed:true});
                var tree = this.tree;
                _.each(models, function(model){
                    var content = tree.where({cid:model.get("key")});
                    if (content.length == 0) {
                        // Update commit SHA
                        content[0].set({sha: model.get("commitSha")});
                    }
                });
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
            }
        });

        return Controller;
    }
);


