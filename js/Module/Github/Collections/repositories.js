define([
        'backbone',
        'Module/Github/backend',
        'Views/framework',
        'Module/Github/Model/repoItemModel'],
    function (Backbone, Backend, Framework, RepoModel) {
        var Repositories = Backbone.Collection.extend({
            groups: [
                {title: "Owner", isDefault: true},
                {title: "Starred"}
            ],
            model: RepoModel,
            sync: function (operation, that, options) {
                if (operation == "read") {
                    var gh = Framework.Backend.Github.github;
                    var user = gh.getUser();
                    var group = options.data.group;

                    var that = this;

                    var handler = function (err, data) {
                        if (err) {
                            _.each(that.groups, function(g) {
                                if (g.title == group) {
                                    g.status = "error";
                                }
                            });
                            if (options.error) options.error(err);
                        }
                        else {
                            _.each(that.groups, function(g) {
                                if (g.title == group) {
                                    g.status = "ok";
                                }
                            });
                            // Extend data with corresponding group
                            _.each(data, function(d){d.group = group;});
                            if (options.success) options.success(data);


                        }
                    };

                    if (group == "Owner") {
                        user.userRepos('umlsynco', handler);
                    }
                    else if (group == "Starred") {
                        user.userStarredRepos('umlsynco', handler);
                    }
                    else {
                        if (options.error) options.error("Unknown group id: " + group);
                    }
                }
            },
            lazyLoad: function (data) {
                if (!data.group)
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
                var status = this.lazyLoad({group:filter});

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
        return Repositories;
    });