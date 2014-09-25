define(['marionette',
        'Views/framework',
        'Controllers/router'],
    function(Marionette, CollectionView, DataProviderView, ContentCollection, Framework, FrameworkRouter) {
        var ContentController = Marionette.Controller.extend({

            initialize: function (options) {
                this.tree = options.tree;                 // tree cache
                this.contentCache = options.contentCache; // Cache of content
                this.head = options.head;                 // head of branch

                // Start the commit
                this.onGithubRepoCommitUpdateHead();
            },
            onGithubRepoCommitUpdateHead: function() {
                this.head.on("sync", this.onGithubRepoCommitUpdateHeadComplete, this);
                this.head.fetch();
            },
            onGithubRepoCommitUpdateHeadComplete: function(data) {
                if (this.tree.getCommit() == data.commit) {
                    this.onGithubRepoCommitContent();
                }
                else {
                    Framework.trigger("github:repo:commit:failure", {error: 1, msg: "HEAD is not up to date !"});
                }
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
            }
        });

        return ContentController;
    }
);


