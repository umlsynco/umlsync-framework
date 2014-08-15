
define(['backbone', 'Views/framework'], function (Backbone, Framework) {
    var GithubRepoItem = Backbone.Model.extend({
            defaults: {
            },
            sync: function (operation, model, somthing, callback) {
                if (operation == "read") {
                    var that = this;
                    var gh = Framework.Backend.Github;
                    var repoId = this.repo;
                    var branch = this.branch;

                    if (!branch) {
                        branch = this.get('sha');
                    }
                    var wr = gh.getRepo(repoId.split('/')[0], repoId.split('/')[1]);
                    wr.getTree(branch, function (err, tree) {
                        if (err) {
                            if (somthing.error) somthing.error(err);
                            if (callback) callback(err);
                        }
                        else {
                            that.collection.add(tree);
                            if (somthing.success) somthing.success();
                            if (callback && callback != "read")
                                callback();
                        }
                    });
                }
            }
        });
    return GithubRepoItem;
});
