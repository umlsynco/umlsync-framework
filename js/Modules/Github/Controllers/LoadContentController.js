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
                    Framework.vent.trigger("content:loaded", _.clone(model.attributes));
                });
                // Handle Error
                this.ContentCache.on("error", function(model) {
                    Framework.vent.trigger("content:loaded", _.clone(model.attributes));
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
                var clone = $.extend({}, data, this.GithubController.getViewInfo());

                // Trigger content in focus to tabs controller
                Framework.vent.trigger("content:focus", clone);
            },

            //
            // Save content
            //
            saveContent: function(data) {
                if (!data.key)
                    return;

                var model = this.ContentCache.where({key:data.key});
                //
                // Expected only one instance of content
                //
                if (model.length > 1) {
                    alert("content was loaded twice !");
                }
                //
                // if content was cached
                //
                else if (model.length == 1) {
                    // Saved content
                    model[0].set("modifiedContent", data.modifiedContent);
                }
                else {
                    alert("model was not found in cache");
                }
            },

            //
            // Respond from mediator to load content
            //
            loadContent: function(data) {
                if (!data.key)
                    return;

                var model = this.ContentCache.where({key:data.key});

                // Expected only one instance of content
                if (model.length > 1) {
                    alert("content was loaded twice !");
                }
                // if content was cached yet
                else if (model.length == 1) {
                    Framework.vent.trigger("content:loaded", _.clone(model[0].attributes));
                }
                // get content from github
                else {
                    this.ContentCache.fetch({
                        add: true,
                        remove:false,
                        merge: false,
                        data: data
                    });
                }
            }

        });
        return LoadContentController;
    }
);
