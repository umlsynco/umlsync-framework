/*
 * Implements load and save content API.
 * The major responsibility is communication with tabs view
 */


define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var LoadContentController = Marionette.Controller.extend({
            initialize: function (options) {
                this.TreeView = options.treeView;
                this.ContentCache = options.cache;
                this.GithubController = options.controller;

                var that = this;
                // Subscribe on local tree events
                this.TreeView.on("file:focus", function (data) {
                    that.contentInFocus(data);
                });

                // trigger loaded
                this.ContentCache.on("add", function(model) {
                    that.triggerContentLoaded(model);
                });
                // Handle Error
                this.ContentCache.on("error", function(model) {
                    that.triggerContentLoaded(model);
                });

                // Subscribe on global tree events
                Framework.vent.on("github:file:load", function(data) {
                    that.loadContent(data);
                });
                Framework.vent.on("github:file:save", function(data) {
                    that.saveContent(data);
                });


            },
            ////////////////////////////////////// CONTENT CACHE FUNCTIONALITY /////////////////////////////////////////
            //
            // Send event to mediator to ask if we could open this content
            //
            contentInFocus: function (data) {
                var clone = $.extend({}, _.pick(data, "key", "sha", 'title', "absPath"), this.GithubController.getViewInfo());

                // Trigger content in focus to tabs controller
                Framework.vent.trigger("content:focus", clone);
            },

            //
            // Save content
            //
            saveContent: function(data) {
                if (!data.key)
                    return;

                var model = this.ContentCache.findNewOrCreate(data);

                if (model) {
                    // Saved content
                    model.set("content", data.modifiedContent);
                }
                else {
                    alert("model was not found in cache");
                }
            },

            triggerContentLoaded: function(model) {
                var clone = $.extend({}, model.attributes, this.GithubController.getViewInfo());
                Framework.vent.trigger("content:loaded", clone);
            },
            //
            // Respond from mediator to load content
            //
            loadContent: function(data) {
                if (!data.key)
                    return;

                var model = this.ContentCache.findNewOrBase(data);

                if (model) {
                    this.triggerContentLoaded(model);
                }
                // get content from github
                else {
                    this.ContentCache.fetch({
                        add: true,
                        remove:false,
                        merge: false,
                        contentData: data
                    });
                }
            }

        });
        return LoadContentController;
    }
);
