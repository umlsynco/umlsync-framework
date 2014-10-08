// Backbone.Github.js 0.0.1
// (c) 2014 Evgeny Alexeyev 

define(['jquery', 'underscore', 'base64', 'backbone', 'marionette'], function (jQuery, _, B64, Backbone, Marionette) {

    var API_URL = 'https://api.github.com';

    var Github = Marionette.Controller.extend({

        initialize: function (options) {
            var token = options.token;
            var user = options.username;

            // Wrap basic methods of Backbone
            var wrapSync = function (method, model, options) {
                var beforeSend = options.beforeSend;
                // wrap before send method
                options.beforeSend = function (xhr) {
                    // Setup request headers
                    xhr.setRequestHeader('Accept', 'application/vnd.github.v3.json');
                    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                    if (token) {
                        xhr.setRequestHeader('Authorization', 'token ' + token);
                    }
                    // apply an original before send method
                    if (beforeSend) return beforeSend.apply(this, arguments);
                };

                if (this.getUrl) {
                    options.url = this.getUrl.apply(this, arguments);
                }
                // Call the Backbone.sync
                return Backbone.Model.prototype.sync.apply(this, arguments);
            };

            Backbone.GithubModel = Backbone.Model.extend({
                sync: wrapSync
            });

            Backbone.GithubCollection = Backbone.Collection.extend({
                sync: wrapSync
            });

            var ContentModel = Backbone.GithubModel.extend({
                //repos/:owner/:repo/git/trees
                url: function (args) {
                    var branch = this.collection.Branch,
                        reponame = branch.collection.Repository.get('full_name');
                    var sha = this.get("sha");
                    if (sha) {
                        return API_URL + "/repos/" + reponame + "/git/blobs/" + sha;
                    }
                    else {
                        return API_URL + "/repos/" + reponame + "/git/blobs";
                    }
                },
                getSavePromise: function() {
                    var dfd2 = $.Deferred();
                    this.save(null, {
                        success: function () {dfd2.resolve();},
                        error: function () {dfd2.reject();}
                    });
                    return dfd2.promise();
                }
            });

            var ContentCollection = Backbone.GithubCollection.extend({
                model: ContentModel,
                // GET /repos/:owner/:repo/git/blobs/:sha
                getUrl: function (method, model, options) {
                    if (method == "read") {
                        var reponame = this.Branch.collection.Repository.get('full_name');
                        var sha = options.contentData ? options.contentData.sha  : this.Branch.get("commit").sha;
                        return API_URL + "/repos/" + reponame + "/git/blobs/" + sha;
                    }
                },
                parse: function (resp, options) {
                    if (resp.encoding == "base64") {
                        resp.content = Base64.decode(resp.content);
                        // Change encoding, because it was decoded
                        resp.encoding = "utf-8";
                    }
                    return [$.extend({}, options.contentData, resp)];
                },
                initialize: function (options, attr) {
                    attr && (this.Branch = attr.branch);
                },
                setBranch: function(model, options) {
                    this.Branch = model;
                    this.reset(options); // Drop an existing items
                },
                findNewOrBase: function(data) {
                    var clone = _.pick(data, "absPath", "title");
                    var models = this.where(clone);
                    // found nothing
                    if (models.length == 0)
                        return;
                    // only base model available
                    if (models.length == 1) {
                        return models[0];
                    }

                    // check if models has new model
                    var result = _.find(models, function(model) {
                        return (model.get("status") == "new");
                    });
                    if (result) return result;

                    // find the concrete model by SHA
                    return _.find(models, function(model) {
                        return (model.get("sha") == data.sha)
                    });

                },
                findNewOrCreate: function(data) {
                    var model = this.findNewOrBase(data);
                    // new model already exists
                    if (model && (model.get("status") == "new")) {
                        return model;
                    }

                    // Clone model except sha which is equal to id
                    if (model) {
                        var mclone = model.clone();
                        // Set up status new
                        // Unset sha - because there is no blob for it
                        // setup base sha which content based on
                        mclone.set({status:"new", sha:null, baseSha: model.get("sha")});
                        this.add(mclone, {silent:true});
                        return mclone;
                    }
                }
            });

            var TreeModel = Backbone.GithubModel.extend({
                //repos/:owner/:repo/git/trees
                url: function (args) {
                    var username = this.login;
                    var reponame = this.repository;
                    var sha = this.get("sha");
                    // TODO: check how to update tree
                    if (sha) {
                        return API_URL + "/repos/" + username + "/" + reponame + "/git/trees/" + sha;
                    }
                    else {
                        return API_URL + "/repos/" + username + "/" + reponame + "/git/trees";
                    }
                },
                getDynatreeData: function() {
                    var ret = {};
                    if (this.get("type") == "blob") {
                        ret["isFolder"] = false;
                        ret["isLazy"] = false;
                        ret["title"] = this.get("path").split('/').pop();
                        ret["key"] = this.cid;
                        ret["sha"] = this.get("sha");
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
            });


            //////////////////////////////////////////////// RAW TREE
            var TreeCollection = Backbone.GithubCollection.extend({
                model: TreeModel,
                getUrl: function (method, model, options) {
                    if (method == "read") {
                        var reponame = this.Branch.collection.Repository.get('full_name');
                        var sha = options.data ? options.data.sha  : this.Branch.get("commit").sha;
                        return API_URL + "/repos/" + reponame + "/git/trees/" + sha;
                    }
                    else if (method == "create") {
                        var reponame = this.Branch.collection.Repository.get('full_name');
                        return API_URL + "/repos/" + reponame + "/git/trees";
                    }
                },
                parse: function (resp, options) {
                    if (options.data && options.data.parentCid)
                        _.each(resp.tree, function(obj) { obj.parentCid = options.data.parentCid || null; obj.parentSha = options.data.sha});
                    return resp.tree;
                },
                initialize: function (options, attr) {
                    attr && (this.Branch = attr.branch);
                },
                loadSubTree: function (model) {
                    if (model.get("type") == "tree" && model.get("sha")) {
                        this.fetch({sha: model.get("sha")});
                    }
                },
                setBranch: function(model, options) {
                    this.Branch = model;
                    var that = this;
                    this.reset(); // Drop an existing items
                    this.fetch(options);
                },
                loadPath: function(absolutePath) {
                    var absPaths =  absolutePath.split("/");
                    if (absPaths[0] == "") {
                        absPaths.shift();
                    }
                    return this._loadPath(absPaths);
                },
                //
                // load path helper
                //
                _loadPath: function(paths, parentSha) {
                    var dfd = $.Deferred();
                    var dfd2 = $.Deferred();
                    var pms = dfd.promise();
                    var path = paths.shift();

                    var models = this.where({path: path, parentSha:parentSha});
                    if (models.length > 1 || models.length == 0) {
                        dfd.reject({reason:"error", message:"Unexpected number of matches of: " + path});
                    }

                    var model = models[0];

                    if (paths.length > 0) {
                        dfd.resolve();
                        if (!model.get("loaded")) {
                            pms.then(this.fetch({
                                add:true,
                                remove:false,
                                merge:false,
                                data: {sha:model.get("sha"), parentCid:model.cid}
                            }));
                        }

                        var modelSha = model.get("sha");
                        pms.then(_.bind(this._loadPath, this, paths, modelSha))
                            .pipe(function(data){
                                dfd2.resolve(data);
                            },
                            function(data) {
                                dfd2.reject(data);
                            }
                        );
                    }
                    else {
                        dfd2.resolve(model);
                    }

                    return dfd2.promise();
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
                        data: {sha:sha, parentCid:data.key, parentSha: sha}
                    });
                },
                save: function(commitModels, options) {
                    return this.sync("create", this, options);
                },
                cacheToTree: function(commitModels) {
                    var commit = this.Branch.get("commit");
                    var items = [];
                    _.each(commitModels, function(model) {
                        items.push({
                            "path": model.get("absPath").substr(1),
                            "mode": "100644",
                            "type": "blob",
                            "sha": model.get("sha")
                        });
                    });
                    return JSON.stringify({
                        "base_tree": commit.sha,
                        "tree": items
                    });
                },
                getSavePromise: function(commitModels) {
                    var m = this;
                    var dfd2 = $.Deferred();
                    this.save(null, {
                        success: function (commitJSON, status, result) {
                            dfd2.resolve(result.responseText);
                        },
                        error: function () {
                            dfd2.reject();
                        },
                        data: this.cacheToTree(commitModels)
                    });
                    return dfd2.promise();
                }
            });

            //////////////////////////////////////////////// BRANCH
            var CommitModel = Backbone.GithubModel.extend({
                url: function (args) {
                    var username = this.Branch.collection.Repository.get("full_name");
                    return API_URL + "/repos/" + username + "/git/commits";
                },
                initialize: function(options, attr) {
                    if (attr)
                      this.Branch = attr.branch;
                },
                getSavePromise: function(commitModels) {
                    var dfd2 = $.Deferred();
                    this.save(null, {
                        success: function (thisModel, resultObject, backboneAjax) {
                            dfd2.resolve(resultObject);
                        },
                        error: function () {
                            dfd2.reject();
                        }
                    });
                    return dfd2.promise();
                }
            });

            //////////////////////////////////////////////// BRANCH
            var BranchModel = Backbone.GithubModel.extend({
                isNew: function() {
                    var commit = this.get("commit");
                    if (commit && commit.sha) {
                        return false;
                    }
                    return true;
                },
                getUrl: function(method, model, options) {
                    if (method == "read") {
                        var username = this.collection.Repository.get("full_name");
                        var branch = this.get("name");
                        return API_URL + "/repos/" + username + "/branches/" + branch;
                    }

/* [TBD]: API to create branch
                    if (method == "create") {
                        var username = this.collection.Repository.get("full_name");
                        var branch = this.get("name");
                        return API_URL + "/repos/" + username + "/git/refs";
                    }
*/

                    if (method == "patch") {
                        var username = this.collection.Repository.get("full_name");
                        var branch = this.get("name");
                        return API_URL + "/repos/" + username + "/git/refs/heads/" + branch;
                    }
                },
                getTree: function () {
                    if (!this.tree) {
                        this.tree = new TreeCollection([], {branch: this});
                    }
                    return this.tree;
                },
                getContentCache: function() {
                    if (!this.content) {
                        this.content = new ContentCollection([], {branch: this});
                    }
                    return this.content;
                },
                createCommit: function(sha, message) {
                    return new CommitModel({parents: [this.get("commit").sha], message:message, tree:sha}, {branch:this});
                },
                getSavePromise: function(finalCommit) {

                    var dfd2 = $.Deferred();
                    this.save({}, {
                        success: function (commitJSON, status, result) {
                            dfd2.resolve(result);
                        },
                        error: function () {
                            dfd2.reject("The branch HEAD is out of date");
                        },
                        data: JSON.stringify({
                            sha: finalCommit.sha,
                            force: false // Prevent overwriting of HEAD if it was changed in a parallel commit
                        }),
                        patch: true
                    });
                    return dfd2.promise();
                }
            });

            Backbone.GithubExtendedCollection = Backbone.GithubCollection.extend({
                isValid: function() {return true;},
                lazyLoad: function (data) {
                    // TODO: replace this.repository on
                    if (!data.group || !this.isValid())
                        return;

                    var that = this;
                    var result;
                    _.each(this.groups, function (group) {
                        if (group.title == data.group) {
                            if (!group.status) {
                                group.status = "loading";

                                that.fetch({
                                    add: true,
                                    remove: false,
                                    merge: false,
                                    data: {group: data.group}
                                });
                            }
                            result = group.status;
                        }
                    });

                    return result;
                },
                setGroupFilter: function (filter) {
                    var status = this.lazyLoad({group: filter});

                    _.each(this.models, function (model) {
                        var visibility = true;
                        if (model.get("group") != filter) {
                            visibility = "none";
                        }
                        model.set("visibility", visibility);
                    });

                    return status;
                }
            });

            var Branches = Backbone.GithubExtendedCollection.extend({
                // Groups is an abstraction which allow us to have tags and branches in a single collection
                groups: [
                    {title: "Branches", isDefault: true},
                    {title: "Tags"}
                ],
                defaultGroup: "Branches",
                isValid: function() {
                    return (this.Repository != undefined);
                },
                getUrl: function (method, model, options) {
                    if (method == "read") {
                        var group = options.group || this.defaultGroup;
                        var user = this.Repository.collection.User;

                        // User information required to start branches
                        var login = user.get('login');

                        if (group == 'Tags') {
                            return API_URL + "/repos/" + login + "/" + this.Repository.get('name') + "/tags";
                        }
                        else {
                            return API_URL + "/repos/" + login + "/" + this.Repository.get('name') + "/branches";
                        }
                    }
                    return "/";
                },
                getBranch: function (name) {
                    return this._getRef(name, 'Branches');
                },
                getTag: function (name) {
                    return this._getRef(name, 'Tags');
                },
                _getRef: function (name, group) {
                    var models = this.where({name: name});
                    if (models.length == 0) {
                        // describe model
                        var model = new BranchModel({collection:this, group: group, name: name});
                        // add on fetch completion
                        var that = this;
                        model.on("sync", function () {
                            that.add(model);
                        });
                        return model;
                    }
                    else {
                        return models[0];
                    }
                },
                initialize: function (options, attr) {
                    attr && (this.Repository = attr.repository);
                },
                setRepository: function(model, options) {
                    options || (options = {reset: true});
                    this.Repository = model;
                    this.fetch(options);
                },
                model: BranchModel
            });

            var Tags = Branches.extend({defaultGroup: 'Tags'});

            //////////////////////////////////////////////// REPOSITORY API
            var RepositoryModel = Backbone.GithubModel.extend({
                defaults: {
                    full_name: 'none'
                },
                url: function (args) {
                    var user = this.collection.User;
                    var username = user.get('login');
                    var reponame = this.get("name");
                    return API_URL + "/repos/" + username + "/" + reponame;
                },
                getBranches: function () {
                    if (!this.branches) {
                        this.branches =
                            new Branches([], {repository: this, // Get pointer on the base model
                                group: 'Branches'});
                    }
                    return this.branches;
                },
                getTags: function () {
                    if (!this.tags) {
                        this.tags = new Branches([], {repository: this, group: 'Tags'});
                    }
                    return this.tags;
                }
            });

            var Repositories = Backbone.GithubExtendedCollection.extend({
                url: function () {
                    return API_URL + (this.login ? "/users/" + this.login + "/repos" : "/user/repos");
                },
                groups: [
                    {title: "Owner", isDefault: true},
                    {title: "Starred"}
                ],
                getRepository: function (name) {
                    var models = this.where({name: name});
                    if (models.length == 0) {
                        // describe model
                        var model = new RepositoryModel({collection:this});
                        // fetch model
                        model.fetch();
                        // add on fetch completion
                        var that = this;
                        model.on("sync", function () {
                            that.add(model);
                        });
                    }
                    return model;
                },
                initialize: function (options, attr) {
                    this.User = attr.user;
                },
                model: RepositoryModel
            });

            //////////////////////////////////////////////// USER API
            var UserModel = Backbone.GithubModel.extend({
                url: function () {
                    var name = this.get("login");
                    return API_URL + "/" + (name ? "users/" + name : "user");
                },
                getRepositories: function () {
                    if (!this.repositories) {
                        this.repositories = new Repositories([], {user: this});
                    }
                    return this.repositories;
                }
            });

            //////////////////////////////////////////////// Controller API
            this.getUser = function (username) {
                return new UserModel({login: username});
            };

            this.getRepositories = function (username) {
                return new Repositories([], {user: this.getUser(username)});
            };

            this.getRefs = function (full_name) {
                // Return Branch model in case of empty name
                if (!full_name) {
                    return new Branches();
                }

                // Provide branch/tags collection
                var items = full_name.split("/");
                if (items.length != 2)
                    return null;

                return new Branches({login: items[0], repository: items[1]});
            };

            this.getTree = function (branch) {
                return new TreeCollection({branch:branch});
            };

            this.getContentCache= function (branch) {
                return new ContentCollection({branch:branch});
            };
        }
    });

    return Github;
});
