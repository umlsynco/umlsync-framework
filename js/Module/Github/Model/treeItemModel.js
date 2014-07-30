
define(['backbone', 'Views/framework'], function (Backbone, Framework) {
    var GithubTreeItem = Backbone.Model.extend({
            defaults: {
            },
            //
            //  Function to covert the Github's tree structure to the dynaTree compatible JSON
            //  @data - github return value
            //  @return - dynatree JSON
            //
            processTree: function (path, data) {
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
                            ret[j]["isLazy"] = true;
                            ret[j]["title"] = item["path"].substr(path.length);
                            ret[j]["sha"] = item["sha"];
                        }
                        ++j;
                    }
                }
                return ret;
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
            },

            getDynatreeData: function() {
                var ret = {};
                if (this.get("type") == "blob") {
                    ret["isFolder"] = false;
                    ret["isLazy"] = false;
                    ret["title"] = this.get("path").split('/').pop();
                    ret["key"] = this.cid;
                }
                else if (this.get("type") == "tree") {
                    ret["isFolder"] = true;
                    ret["isLazy"] = true;
                    ret["title"] = this.get("path").split('/').pop();
                    ret["key"] = this.cid;
                }
                var pcid = this.get("parentCid");
                if (pcid) {
                    ret["parentCid"] = pcid;
                }

                return ret;
            }
        })
        ;
    return GithubTreeItem;
});
