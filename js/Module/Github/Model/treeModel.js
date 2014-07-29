define(['backbone', 'github'], function (Backbone, Github) {
    var GithubTree = Backbone.Model.extend({
        defaults: {
            githubTree: null, // Github tree structure
            tree: null // dynatree structure
        },
        //
        //  Function to covert the Github's tree structure to the dynaTree compatible JSON
        //  @data - github return value
        //  @return - dynatree JSON
        //
        processTree: function (data) {
            if (data) {
                var ret = [];
                for (j in data["tree"]) {
                    ret[j] = {};
                    if (data["tree"][j]["type"] == "blob") {
                        ret[j]["isFolder"] = false;
                        ret[j]["isLazy"] = false;
                        ret[j]["title"] = data["tree"][j]["path"];
                        ret[j]["sha"] = data["tree"][j]["sha"];
                        ret[j]["url"] = data["tree"][j]["url"];
                    }
                    else if (data["tree"][j]["type"] == "tree") {
                        ret[j]["isFolder"] = true;
                        ret[j]["isLazy"] = true;
                        ret[j]["title"] = data["tree"][j]["path"];
                        ret[j]["sha"] = data["tree"][j]["sha"];
                    }
                }
                return ret;
            }
            return data;
        },
        sync: function (callback) {
            var that = this;
            var gh = new Github("umlsynco");
            var repoId = this.get("repo");
            var branch = this.get("branch");

            var wr = gh.getRepo(repoId.split('/')[0], repoId.split('/')[1]);
            wr.getTree(branch, function (err, tree) {
                if (err) {
                    callback(err);
                }
                else {
                    var datax = {};
                    datax["tree"] = tree;
                    var real_tree = {}
                    real_tree = that.processTree(datax);
                    that.set("tree", real_tree);
                    that.set("githubTree", tree);
                    callback();
                }
            });
        }
    });
    return GithubTree;
});
