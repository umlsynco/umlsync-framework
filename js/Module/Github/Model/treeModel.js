define(['backbone', 'Views/framework'], function (Backbone, Framework) {
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
            processRecursiveTree: function (path, data) {
                var ret = [];
                var j = 0;
                while (data.length > 0) {
                    if (data[0]["path"].indexOf(path) != 0) {
                        return ret;
                    }
                    else {
                        var item = data.shift();
                        ret[j] = {};
                        if (item["type"] == "blob") {
                            ret[j]["isFolder"] = false;
                            ret[j]["isLazy"] = false;
                            ret[j]["title"] = item["path"].substr(path.length);
                            ret[j]["sha"] = item["sha"];
                            ret[j]["url"] = item["url"];
                        }
                        else if (item["type"] == "tree") {
                            ret[j]["isFolder"] = true;
                            ret[j]["isLazy"] = false;
                            ret[j]["title"] = item["path"].substr(path.length);
                            ret[j]["sha"] = item["sha"];
                            ret[j]["children"] = this.processRecursiveTree(path + ret[j]["title"] + '/', data);
                        }
                        ++j;
                    }
                }
                return ret;
            },
            sync: function (operation, model, somthing, callback) {
                if (operation == "read") {
                    alert("READ CALLED");
                    var that = this;
                    var gh = Framework.Backend.Github;
                    var repoId = this.repo;
                    var branch = this.branch;

                    var wr = gh.getRepo(repoId.split('/')[0], repoId.split('/')[1]);
                    wr.getTreeRecursive(branch, function (err, tree) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            var real_tree = {}
                            real_tree = that.processRecursiveTree('', tree);
                            that.set("tree", real_tree);
                            that.set("githubTree", tree);
                            if (somthing.success) somthing.success();
                            if (callback && callback != "read")
                                callback();
                        }
                    });
                }
            }
        })
        ;
    return GithubTree;
})
;
