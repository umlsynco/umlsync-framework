
define(['backbone', 'Views/framework','.././Github/Model/treeItemModel'], function (Backbone, Framework, TreeModel) {
    var TreeCollection = Backbone.Collection.extend({
        model: TreeModel,
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
        sync: function (operation, that, options) {
            if (operation == "read") {
                var gh = Framework.Backend.Github.github;
                var repoId = options.data.repo;
                var branch = options.data.branch;

                if (options.data && options.data.sha) {
                    // all items extracts by sha after root load
                    branch = options.data.sha;
                }
                else {
                    // update working repo on branch/repo update
                    this.wr = gh.getRepo(repoId.split('/')[0], repoId.split('/')[1]);
                }

                this.wr.getTree(branch, function (err, tree) {
                    if (err) {
                        if (options.error) options.error(err);
                    }
                    else {
                        // Simplify work with dynatree
                        if (options.data && options.data.parentCid) {
                            for (var r in tree) {
                                tree[r]['parentCid'] = options.data.parentCid;
                            }
                        }
                        if (options.success) options.success(tree);
                    }
                });
            }
        },
        lazyLoad: function(data) {
            if (!data.key)
              return;

            var model = this.get({cid:data.key});

            if (!model)
              return;

            var sha = model.get('sha');
            if (!sha)
              return;
            this.fetch({
                add: true,
                remove:false,
                merge: false,
                data: {sha:sha, parentCid:data.key}
            });
        }
    });
    return TreeCollection;
});