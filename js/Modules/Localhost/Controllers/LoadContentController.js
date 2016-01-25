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
                this.TreeViewController = options.treeViewController;
                this.ContentCache = options.cache;
                this.GithubController = options.controller;

                var that = this;
                // Subscribe on local tree events
                this.TreeViewController.on("activate", function (view) {
                    if (view.model.get("type") == "tree")
                      return;
                    var data = view.model.getDynatreeData();
                    data["absPath"] = that.TreeViewController.getAbsolutePath(view.model);
                    that.contentInFocus(data);
                });

                // trigger loaded
                this.ContentCache.on("add", function(model) {
                    // Waiting for load content completion
                    // therefore we need to mark a new content somehow
                    if (model.get("status") != "new") {
                        that.triggerContentLoaded(model);
                    }
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
                //
                // key - is tree view option
                // if key undefined thatn we should load path
                // in a regular case path to content should be loaded
                // but it is not true for embedded content
                //
                // TODO: cross reference is not embedded content
                //       but data provider should be able to load
                //       path for this case too
                if (!data.key) {
                    if (data.isEmbedded) {
                        this._loadEmbeddedContent(data);
                    }
                    else {
                        alert("Requested invalid resource key: " + data.absPath);
                    }
                    return;
                }

                // Content cach should contain cache only
                // it is not a good idea to share this model
                // 
                var model = this.ContentCache.findNewOrBase(data);

                if (model ) {
                    var dataModel = new Backbone.Model($.extend({}, model.attributes, data));
                    this.triggerContentLoaded(dataModel);
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
            },
            //
            // The purpose of this 
            //
            //
            _loadEmbeddedContent: function(data) {
				// load path only
				var treeView = this.TreeViewController,
				view = this,
				embeddedHandler = function(search, sub) {
				    var title = data.absPath.split("/").pop(),
				    fileModel = treeView.tree.filter(function(model) {
						if (model.get("parentCid") == search.parentCid
						  && model.get("type") == "blob"
						  && model.get("path") == title) {
							  return true;
						}
						return false;
					});
					if (fileModel.length > 0) {
						var firstModel = fileModel[0];

						// this.GithubController.getViewInfo() - should be on place
						// absPath should be on place too
						// .... 
						// TODO: Drop extra parameters copy
						var clone = $.extend(data, _.pick(firstModel.getDynatreeData(), "key", "sha", 'title', "absPath"), view.GithubController.getViewInfo());
						view.loadContent(clone);
					}
				};
				
				this.TreeViewController.getSubPaths(data.absPath.substr(0, data.absPath.lastIndexOf("/")), function(data2, x ,y) {
                     if (data2.status == "valid") {
						embeddedHandler(data2, x, y);
				     }
				     if (data2.status == "file") {
						 alert("REWORK THIS CODE TO MAKE LIVE EASIER !!!");
					 }
                });
			}
        });
        return LoadContentController;
    }
);
